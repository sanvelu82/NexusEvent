const API_URL = "https://script.google.com/macros/s/AKfycbyUEi-QloY8vMAg_Nq0vm3Qh-wK4R4zJ7VyDzDpu9UwhJPpB6pZ_xzrhz7BEBT3iA8v7A/exec";

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

export async function searchPickup(regNo) {
  return callAPI({
    action: "searchPickup",
    regNo,
  });
}

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
