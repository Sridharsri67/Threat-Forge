const axios = require("axios");

exports.lookupIOC = async (type, value) => {
    // AbuseIPDB only supports IP addresses
    if (type !== "ip") {
        return null;
    }

    const apiKey = process.env.ABUSEIPDB_API_KEY;

    if (!apiKey) {
        // Return a realistic mock if API key is not configured
        console.warn("AbuseIPDB API key not found. Returning mock data.");
        
        // Let's generate somewhat randomized mock data based on the IP address
        // to make the demo interactive
        const ipLastOctet = parseInt(value.split(".").pop()) || 1;
        const mockConfidence = ipLastOctet % 2 === 0 ? Math.min(ipLastOctet * 2, 100) : 0;
        const mockReports = mockConfidence > 0 ? Math.floor(ipLastOctet / 2) : 0;
        const countryCode = ipLastOctet % 3 === 0 ? "US" : ipLastOctet % 3 === 1 ? "RU" : "CN";
        const countryName = ipLastOctet % 3 === 0 ? "United States" : ipLastOctet % 3 === 1 ? "Russian Federation" : "China";
        const latitude = ipLastOctet % 3 === 0 ? 37.0902 : ipLastOctet % 3 === 1 ? 61.5240 : 35.8617;
        const longitude = ipLastOctet % 3 === 0 ? -95.7129 : ipLastOctet % 3 === 1 ? 105.3188 : 104.1954;
        
        return {
            ipAddress: value,
            abuseConfidenceScore: mockConfidence,
            totalReports: mockReports,
            countryCode,
            countryName,
            latitude,
            longitude,
            isp: ipLastOctet % 2 === 0 ? "DigitalOcean LLC" : "Comcast Cable",
            domain: ipLastOctet % 2 === 0 ? "digitalocean.com" : "comcast.net",
            usageType: ipLastOctet % 2 === 0 ? "Data Center/Web Hosting/Transit" : "Fixed Line ISP",
            isWhitelisted: false,
            lastReportedAt: mockReports > 0 ? new Date().toISOString() : null
        };
    }

    try {
        const response = await axios.get("https://api.abuseipdb.com/api/v2/check", {
            headers: {
                "Key": apiKey,
                "Accept": "application/json"
            },
            params: {
                ipAddress: value,
                maxAgeInDays: 90
            }
        });

        const data = response.data?.data || {};

        return {
            ipAddress: data.ipAddress || value,
            abuseConfidenceScore: data.abuseConfidenceScore || 0,
            totalReports: data.totalReports || 0,
            countryCode: data.countryCode || null,
            countryName: data.countryName || null,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            isp: data.isp || null,
            domain: data.domain || null,
            usageType: data.usageType || null,
            isWhitelisted: data.isWhitelisted || false,
            lastReportedAt: data.lastReportedAt || null
        };
    } catch (error) {
        console.error("AbuseIPDB API error:", error.message);
        throw new Error(`AbuseIPDB lookup failed: ${error.message}`);
    }
};
