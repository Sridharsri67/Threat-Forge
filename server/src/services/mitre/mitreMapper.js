const MITRE_MAPPINGS = {
    ransomware: {
        id: "T1486",
        name: "Data Encrypted for Impact",
        tactic: "Impact",
        description: "Adversaries may encrypt data on non-volatile media or the boot sector on systems within a network to interrupt the availability of system and network resources."
    },
    keylogger: {
        id: "T1056.001",
        name: "Input Capture: Keylogging",
        tactic: "Credential Access",
        description: "Adversaries may log user keystrokes to collect data as the user types it, which can include credentials or other sensitive information."
    },
    stealer: {
        id: "T1003",
        name: "OS Credential Dumping",
        tactic: "Credential Access",
        description: "Adversaries may attempt to dump credentials to obtain account login and credential material, normally in the form of a hash or a cleartext password, from the operating system."
    },
    credential: {
        id: "T1003",
        name: "OS Credential Dumping",
        tactic: "Credential Access",
        description: "Adversaries may attempt to dump credentials to obtain account login and credential material, normally in the form of a hash or a cleartext password, from the operating system."
    },
    c2: {
        id: "T1071",
        name: "Application Layer Protocol",
        tactic: "Command and Control",
        description: "Adversaries may communicate using application layer protocols to avoid detection/network filtering by blending in with existing traffic."
    },
    beacon: {
        id: "T1071.001",
        name: "Application Layer Protocol: Web Protocols",
        tactic: "Command and Control",
        description: "Adversaries may communicate using web protocols, such as HTTP or HTTPS, to blend in with standard web traffic and bypass perimeter security."
    },
    phishing: {
        id: "T1566",
        name: "Phishing",
        tactic: "Initial Access",
        description: "Adversaries may send phishing messages to gain access to victim systems. All forms of phishing are types of social engineering."
    },
    trojan: {
        id: "T1204.002",
        name: "User Execution: Malicious File",
        tactic: "Execution",
        description: "Adversaries may rely upon a user opening a malicious file to execute code, e.g. opening a trojanized attachment."
    },
    backdoor: {
        id: "T1105",
        name: "Ingress Tool Transfer",
        tactic: "Command and Control",
        description: "Adversaries may transfer tools or other files into a victim environment from an external system, often utilizing a backdoor."
    },
    miner: {
        id: "T1496",
        name: "Resource Hijacking",
        tactic: "Impact",
        description: "Adversaries may leverage the resources of co-opted systems in order to solve resource-intensive problems, such as cryptocurrency mining."
    },
    exploit: {
        id: "T1210",
        name: "Exploitation of Remote Services",
        tactic: "Lateral Movement",
        description: "Adversaries may exploit software vulnerabilities in remote services to gain unauthorized access to internal systems."
    },
    scanning: {
        id: "T1595",
        name: "Active Scanning",
        tactic: "Reconnaissance",
        description: "Adversaries may execute active scans to gather information about network hosts, services, and ports to identify vulnerabilities."
    }
};

exports.mapTags = (tags = []) => {
    const mappings = [];
    const lowerTags = tags.map(t => t.toLowerCase());

    for (const [key, val] of Object.entries(MITRE_MAPPINGS)) {
        if (lowerTags.some(tag => tag.includes(key) || key.includes(tag))) {
            // Avoid duplicates
            if (!mappings.some(m => m.id === val.id)) {
                mappings.push(val);
            }
        }
    }

    // Default general mapping if the IOC is malicious but has no matching tags
    if (mappings.length === 0 && lowerTags.length > 0) {
        mappings.push({
            id: "T1204",
            name: "User Execution",
            tactic: "Execution",
            description: "Adversaries may rely on user interaction to execute malicious actions, such as clicking links or running payloads."
        });
    }

    return mappings;
};
