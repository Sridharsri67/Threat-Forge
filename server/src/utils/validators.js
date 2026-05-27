exports.isValidIP = (ip) => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
};

exports.isValidDomain = (domain) => {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainRegex.test(domain);
};

exports.isValidURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
};

exports.isValidHash = (hash) => {
    const md5Regex = /^[a-f0-9]{32}$/i;
    const sha1Regex = /^[a-f0-9]{40}$/i;
    const sha256Regex = /^[a-f0-9]{64}$/i;
    return md5Regex.test(hash) || sha1Regex.test(hash) || sha256Regex.test(hash);
};

exports.validateIOC = (type, value) => {
    if (!type || !value) return false;
    
    switch (type) {
        case "ip":
            return exports.isValidIP(value);
        case "domain":
            return exports.isValidDomain(value);
        case "url":
            return exports.isValidURL(value);
        case "hash":
            return exports.isValidHash(value);
        default:
            return false;
    }
};
