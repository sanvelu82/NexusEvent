import axios from "axios";
const API_URL = "https://script.google.com/macros/s/AKfycbyIvSQkvFr6AKx3tdtzeZLvNfBuAxtVSe-hmp-25-QY0izZG5C_to4bWq7bj4p490yqNQ/exec";

async function callAPI(payload) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { status: "error" };
  }
}

export async function studentLogin(regNo, dob) {
  return callAPI({
    action: "studentLogin",
    regNo,
    dob,
  });
}

export async function registerPickup(data) {
  return callAPI({
    action: "registerPickup",
    ...data,
  });
}

export async function staffLogin(username, password) {
  return callAPI({
    action: "staffLogin",
    username,
    password,
  });
}

export const searchPickup = async (regNo) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      mode: "cors", // Use cors mode
      headers: {
        "Content-Type": "text/plain", // Use text/plain to avoid preflight
      },
      body: JSON.stringify({
        action: "searchPickup",
        regNo: regNo,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export async function approvePickup(regNo, facultyName) {
  return callAPI({
    action: "approvePickup",
    regNo,
    facultyName,
  });
}

export async function markPicked(regNo) {
  return callAPI({
    action: "markPicked",
    regNo,
  });
}

export async function getNotRegistered() {
  return callAPI({
    action: "getNotRegistered",
  });
}
