const axios = require("axios");

const BASE_URL = "https://www.virustotal.com/api/v3";

exports.lookupIOC = async (type, value) => {

    let endpoint = "";

    switch (type) {

        case "ip":
            endpoint = `/ip_addresses/${value}`;
            break;

        case "domain":
            endpoint = `/domains/${value}`;
            break;

        case "hash":
            endpoint = `/files/${value}`;
            break;

        case "url":
            const encoded = Buffer.from(value)
                .toString("base64")
                .replace(/=/g, "");

            endpoint = `/urls/${encoded}`;
            break;

        default:
            throw new Error("Unsupported IOC type");
    }

    const response = await axios.get(
        `${BASE_URL}${endpoint}`,
        {
            headers: {
                "x-apikey": process.env.VT_API_KEY
            }
        }
    );

    const attributes = response.data.data.attributes;

    return {

        maliciousCount:
            attributes.last_analysis_stats?.malicious || 0,

        suspiciousCount:
            attributes.last_analysis_stats?.suspicious || 0,

        reputation:
            attributes.reputation || 0,

        tags:
            attributes.tags || [],

        lastAnalysis:
            attributes.last_analysis_date || null
    };
};