exports.calculate = (vtDetections, otxPulses) => {

    const score =
        (vtDetections * 3) + otxPulses;

    if (score >= 15) {
        return "Critical";
    }

    if (score >= 8) {
        return "High";
    }

    if (score >= 4) {
        return "Medium";
    }

    if (score >= 1) {
        return "Low";
    }

    return "Informational";
};