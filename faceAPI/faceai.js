// faceai.js
const faceapi = require("face-api.js");
const path = require("path");
const canvas = require("canvas");
const User = require("../models/userSchema");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function loadModels(modelDir) {
  console.log("Loading models...");
  try {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelDir);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelDir);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelDir);
    await faceapi.nets.faceExpressionNet.loadFromDisk(modelDir);
    await faceapi.nets.tinyFaceDetector.loadFromDisk(modelDir);
    console.log("Models loaded successfully");
  } catch (error) {
    console.error("Error loading models", error);
    throw new Error("Error loading models");
  }
}

async function trainModel(imagePath, label) {
  console.log(`Training model for ${imagePath} ${label}...`);
  try {
    const img = await canvas.loadImage(imagePath);
    const detections = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      console.error("No face detected in image");
      return {
        error:
          "No face detected in the image. Please ensure your face is clearly visible and try again.",
      };
    }
    const faceDescriptor = Array.from(detections.descriptor);

    console.log(`Model trained successfully for ${label}`);
    console.log("Training descriptor length:", faceDescriptor.length);
    console.log("Training descriptors:", faceDescriptor);
    return {
      success: true,
      descriptors: {
        label: label,
        descriptor: faceDescriptor,
      },
    };
  } catch (error) {
    console.error("Error training model", error);
    return { error: `Face recognition error: ${error.message}` };
  }
}

async function recognizeFace(imagePath) {
  console.log("Recognizing face...");
  try {
    // Load the descriptors from the database
    const users = await User.find({});
    console.log(users);
    const labeledDescriptorsArray = users.map((user) => {
      const descriptor =
        typeof user.faceDescriptor.descriptor === "Float32Array"
          ? user.faceDescriptor.descriptor
          : new Float32Array(user.faceDescriptor.descriptor);
      return new faceapi.LabeledFaceDescriptors(user.faceDescriptor.label, [
        descriptor,
      ]);
    });

    console.log(
      "Number of descriptors for matching:",
      labeledDescriptorsArray.length
    );

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptorsArray);

    const img = await canvas.loadImage(imagePath);
    const singleResult = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!singleResult) {
      console.error("No face detected in image");
      return { recognized: false, error: "No face detected in image" };
    }

    console.log(
      "Recognition descriptor length:",
      singleResult.descriptor.length
    );
    console.log("Recognition descriptor:", singleResult.descriptor);

    const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor);
    console.log("bestMatch", bestMatch);
    console.log("bestMatch.label", bestMatch.label);
    if (bestMatch.label) {
      console.log("Face recognized: ", bestMatch.label);
      return { recognized: true, label: bestMatch.label };
    } else {
      console.error("Face not recognized");
      return { recognized: false, error: "Face not recognized" };
    }
  } catch (error) {
    console.error("Error recognizing face", error);
    return { recognized: false, error: error.message };
  }
}

module.exports = {
  loadModels,
  trainModel,
  recognizeFace,
};
