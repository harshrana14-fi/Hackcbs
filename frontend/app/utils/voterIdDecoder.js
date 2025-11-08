/**
 * Decodes a voter ID to extract location information
 * Format: VC + SS + DD + CC + YY + RAND6 + CHK
 */

// Import the location codes (we'll need to recreate them for frontend)
const stateCodes = {
  "Andhra Pradesh": "AP",
  "Arunachal Pradesh": "AR",
  "Assam": "AS",
  "Bihar": "BR",
  "Chhattisgarh": "CG",
  "Goa": "GA",
  "Gujarat": "GJ",
  "Haryana": "HR",
  "Himachal Pradesh": "HP",
  "Jharkhand": "JH",
  "Karnataka": "KA",
  "Kerala": "KL",
  "Madhya Pradesh": "MP",
  "Maharashtra": "MH",
  "Manipur": "MN",
  "Meghalaya": "ML",
  "Mizoram": "MZ",
  "Nagaland": "NL",
  "Odisha": "OD",
  "Punjab": "PB",
  "Rajasthan": "RJ",
  "Sikkim": "SK",
  "Tamil Nadu": "TN",
  "Telangana": "TG",
  "Tripura": "TR",
  "Uttar Pradesh": "UP",
  "Uttarakhand": "UK",
  "West Bengal": "WB",

  // Union Territories
  "Andaman and Nicobar Islands": "AN",
  "Chandigarh": "CH",
  "Dadra and Nagar Haveli and Daman and Diu": "DH",
  "Delhi": "DL",
  "Jammu and Kashmir": "JK",
  "Ladakh": "LA",
  "Lakshadweep": "LD",
  "Puducherry": "PY",
};

// Reverse mapping for decoding
const reverseStateCodes = {};
for (const [state, code] of Object.entries(stateCodes)) {
  reverseStateCodes[code] = state;
}

// Sample district codes for decoding (in a real app, this would be more comprehensive)
const districtCodes = {
  Rajasthan: {
    Jaipur: "06",
    Jodhpur: "07",
    Udaipur: "08",
    Kota: "09",
    Ajmer: "10",
  },
  Maharashtra: {
    Mumbai: "04",
    Pune: "05",
    Nagpur: "06",
    Nashik: "07",
    Aurangabad: "08",
  },
  "Uttar Pradesh": {
    Lucknow: "11",
    Kanpur: "12",
    Varanasi: "13",
    Agra: "14",
    Prayagraj: "15",
  },
  Delhi: {
    "New Delhi": "01",
    "South Delhi": "02",
    "North Delhi": "03",
    "East Delhi": "04",
  },
  Karnataka: {
    Bengaluru: "21",
    Mysuru: "22",
    Mangaluru: "23",
    Hubballi: "24",
  },
};

// Reverse mapping for districts
const reverseDistrictCodes = {};
for (const [state, districts] of Object.entries(districtCodes)) {
  reverseDistrictCodes[state] = {};
  for (const [district, code] of Object.entries(districts)) {
    reverseDistrictCodes[state][code] = district;
  }
}

// Sample constituency codes for decoding
const constituencyCodes = {
  Jaipur: {
    "Jaipur South": "23",
    "Jaipur North": "24",
    "Jaipur Rural": "25",
  },
  Mumbai: {
    "Mumbai South": "11",
    "Mumbai North": "12",
  },
  Bengaluru: {
    "Bangalore South": "31",
    "Bangalore Central": "32",
    "Bangalore North": "33",
  },
  Lucknow: {
    "Lucknow Central": "41",
    "Lucknow East": "42",
  },
};

// Reverse mapping for constituencies
const reverseConstituencyCodes = {};
for (const [district, constituencies] of Object.entries(constituencyCodes)) {
  reverseConstituencyCodes[district] = {};
  for (const [constituency, code] of Object.entries(constituencies)) {
    reverseConstituencyCodes[district][code] = constituency;
  }
}

/**
 * Decodes a voter ID to extract location information
 * @param {string} voterId - The voter ID to decode
 * @returns {Object} Decoded information
 */
export function decodeVoterId(voterId) {
  // Basic validation
  if (!voterId || voterId.length !== 17 || !voterId.startsWith('VC')) {
    return {
      valid: false,
      error: "Invalid voter ID format"
    };
  }

  try {
    // Extract components
    const stateCode = voterId.substring(2, 4);
    const districtCode = voterId.substring(4, 6);
    const constituencyCode = voterId.substring(6, 8);
    const year = voterId.substring(8, 10);
    const randomPart = voterId.substring(10, 16);
    const checksum = voterId.substring(16, 17);

    // Decode state
    const state = reverseStateCodes[stateCode] || "Unknown State";

    // Decode district (this would need more comprehensive data in a real app)
    let district = "Unknown District";
    for (const [stateName, districts] of Object.entries(reverseDistrictCodes)) {
      if (districts[districtCode]) {
        district = districts[districtCode];
        break;
      }
    }

    // Decode constituency (this would need more comprehensive data in a real app)
    let constituency = "Unknown Constituency";
    for (const [districtName, constituencies] of Object.entries(reverseConstituencyCodes)) {
      if (constituencies[constituencyCode]) {
        constituency = constituencies[constituencyCode];
        break;
      }
    }

    return {
      valid: true,
      state,
      district,
      constituency,
      stateCode,
      districtCode,
      constituencyCode,
      year,
      randomPart,
      checksum
    };
  } catch (error) {
    return {
      valid: false,
      error: "Failed to decode voter ID"
    };
  }
}

export default decodeVoterId;