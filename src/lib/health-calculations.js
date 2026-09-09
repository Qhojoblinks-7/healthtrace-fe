export function calculateBMI(weightKg, heightCm) {
  try {
    const weight = parseFloat(weightKg);
    const height = parseFloat(heightCm);
    if (!weight || !height || weight <= 0 || height <= 0) return null;
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  } catch {
    return null;
  }
}

export function getBMICategory(bmi) {
  if (bmi === null || bmi === undefined) return null;
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function getBloodPressureStatus(systolic, diastolic) {
  try {
    const sysVal = parseFloat(systolic);
    const diaVal = parseFloat(diastolic);
    if (!sysVal || !diaVal) return null;

    if (sysVal > 180 || diaVal > 120) return "Crisis";
    if (sysVal >= 140 || diaVal >= 90) return "Stage 2";
    if (sysVal >= 130 || diaVal >= 80) return "Stage 1";
    if (sysVal >= 120 && diaVal < 80) return "Elevated";
    return "Normal";
  } catch {
    return null;
  }
}

export function getGlucoseStatus(glucose) {
  try {
    const gVal = parseFloat(glucose);
    if (!gVal && gVal !== 0) return null;
    if (gVal >= 200) return "Diabetes";
    if (gVal >= 140) return "Prediabetes";
    return "Normal";
  } catch {
    return null;
  }
}

export function evaluateClinicalUrgency(data = {}) {
  try {
    const sysVal = data.systolic ?? data.systolic_bp ?? data.bp_sys;
    if (sysVal !== undefined && parseFloat(sysVal) >= 180) return true;

    const diaVal = data.diastolic ?? data.diastolic_bp ?? data.bp_dia;
    if (diaVal !== undefined && parseFloat(diaVal) >= 120) return true;

    const glucoseVal = data.glucose ?? data.glucose_level ?? data.blood_sugar;
    if (glucoseVal !== undefined && glucoseVal !== null && glucoseVal !== "") {
      const gNum = parseFloat(glucoseVal);
      if (gNum >= 250 || gNum <= 70) return true;
    }
  } catch {
    // ignore parse errors
  }
  return false;
}
