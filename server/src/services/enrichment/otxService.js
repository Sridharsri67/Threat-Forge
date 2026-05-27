const axios = require("axios");

exports.lookupIOC = async (type, value) => {

    let otxType = "";

    switch (type) {

        case "ip":
            otxType = "IPv4";
            break;

        case "domain":
            otxType = "domain";
            break;

        case "hash":
            otxType = "file";
            break;

        case "url":
            otxType = "url";
            break;

        default:
            throw new Error("Unsupported IOC type");
    }

    const response = await axios.get(
        `https://otx.alienvault.com/api/v1/indicators/${otxType}/${value}/general`,
        {
            headers: {
                "X-OTX-API-KEY": process.env.OTX_API_KEY
            }
        }
    );

    return {

        pulseCount:
            response.data.pulse_info?.count || 0,

        pulses:
            response.data.pulse_info?.pulses || []
    };
};