// Import face-api.js library
import * as faceapi from "@vladmandic/face-api"

// Face-api.js utilities for face recognition
export const loadFaceApiModels = async () => {
  const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model/"

  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ])
    console.log("Face API models loaded successfully")
    return true
  } catch (error) {
    console.error("Error loading Face API models:", error)
    return false
  }
}

// Detect faces in an image
export const detectFaces = async (input) => {
  try {
    const detections = await faceapi
      .detectAllFaces(input, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withFaceExpressions()

    return detections
  } catch (error) {
    console.error("Error detecting faces:", error)
    return []
  }
}

// Compare two face descriptors with threshold
export const compareFaces = (descriptor1, descriptor2, threshold = 0.6) => {
  if (!descriptor1 || !descriptor2) return false

  const distance = faceapi.euclideanDistance(descriptor1, descriptor2)
  return distance < threshold
}

// Find best matching face
export const findBestMatch = (faceDescriptor, referenceDescriptors) => {
  if (!faceDescriptor || !referenceDescriptors.length) return null

  let bestMatch = null
  let bestDistance = Number.POSITIVE_INFINITY

  referenceDescriptors.forEach((ref) => {
    const distance = faceapi.euclideanDistance(faceDescriptor, ref)
    if (distance < bestDistance) {
      bestDistance = distance
      bestMatch = { distance, index: referenceDescriptors.indexOf(ref) }
    }
  })

  return bestMatch && bestMatch.distance < 0.6 ? bestMatch : null
}

// Convert tensor to array
export const descriptorToArray = (descriptor) => {
  return Array.from(descriptor)
}

// Convert array to tensor
export const arrayToDescriptor = (array) => {
  return new Float32Array(array)
}
