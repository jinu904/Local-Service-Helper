import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const modelDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");
const modelPath = path.join(modelDirectory, "provider-suitability-model.json");

const sigmoid = (value) => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, value))));
const dot = (left, right) => left.reduce((total, value, index) => total + value * right[index], 0);

function providerFeatures(provider) {
  return [
    Number(provider.rating || 0) / 5,
    Math.min(Math.log10(Number(provider.review_count || 0) + 1) / 2.2, 1),
    Math.min(Number(provider.experience_years || 0) / 15, 1),
  ];
}

// The label is intentionally derived from the project's stored provider
// performance signals. Once more completed bookings and reviews exist, the
// model retrains from that growing dataset on every server restart.
function isTrustedProvider(provider, reviewMedian) {
  return Number(provider.rating || 0) >= 4.7 && Number(provider.review_count || 0) >= reviewMedian;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function standardise(rows, means, scales) {
  return rows.map((row) => row.map((value, index) => (value - means[index]) / scales[index]));
}

export function trainProviderSuitabilityModel(providers) {
  if (!providers?.length) return null;

  const records = providers.map((provider) => ({ provider, values: providerFeatures(provider) }));
  const reviewMedian = median(providers.map((provider) => Number(provider.review_count || 0)));
  const labels = records.map(({ provider }) => Number(isTrustedProvider(provider, reviewMedian)));
  const means = records[0].values.map((_, index) => records.reduce((sum, item) => sum + item.values[index], 0) / records.length);
  const scales = records[0].values.map((_, index) => {
    const variance = records.reduce((sum, item) => sum + (item.values[index] - means[index]) ** 2, 0) / records.length;
    return Math.sqrt(variance) || 1;
  });
  const inputs = standardise(records.map((item) => item.values), means, scales);

  // A deterministic 80/20 split keeps evaluation repeatable for the demo.
  const testIndexes = new Set(inputs.map((_, index) => index).filter((index) => index % 5 === 0));
  const trainIndexes = inputs.map((_, index) => index).filter((index) => !testIndexes.has(index));
  const weights = Array(inputs[0].length + 1).fill(0);
  const learningRate = 0.18;
  const regularisation = 0.01;

  for (let epoch = 0; epoch < 900; epoch += 1) {
    const gradient = Array(weights.length).fill(0);
    for (const index of trainIndexes) {
      const vector = [1, ...inputs[index]];
      const error = sigmoid(dot(weights, vector)) - labels[index];
      vector.forEach((value, featureIndex) => { gradient[featureIndex] += error * value; });
    }
    weights.forEach((weight, index) => {
      const penalty = index === 0 ? 0 : regularisation * weight;
      weights[index] -= learningRate * ((gradient[index] / trainIndexes.length) + penalty);
    });
  }

  const correct = [...testIndexes].filter((index) => {
    const probability = sigmoid(dot(weights, [1, ...inputs[index]]));
    return Number(probability >= 0.5) === labels[index];
  }).length;
  const validationAccuracy = testIndexes.size ? correct / testIndexes.size : null;
  const model = {
    modelType: "Logistic Regression",
    modelVersion: "1.0",
    trainedAt: new Date().toISOString(),
    featureNames: ["normalised_rating", "review_confidence", "normalised_experience"],
    trainingRecords: records.length,
    positiveClass: "trusted provider",
    labelRule: "rating >= 4.7 and review count >= dataset median",
    means,
    scales,
    weights,
    validationAccuracy: validationAccuracy === null ? null : Number(validationAccuracy.toFixed(3)),
  };

  fs.mkdirSync(modelDirectory, { recursive: true });
  fs.writeFileSync(modelPath, JSON.stringify(model, null, 2));
  return model;
}

export function predictProviderSuitability(model, provider) {
  if (!model) return 0.5;
  const values = providerFeatures(provider);
  const normalised = values.map((value, index) => (value - model.means[index]) / model.scales[index]);
  return sigmoid(dot(model.weights, [1, ...normalised]));
}
