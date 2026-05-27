// API endpoints for Threat Forge IOC Platform

const BASE_URL = import.meta.env.VITE_API_URL || "";

export const lookupIOC = async (type, value) => {
  const response = await fetch(`${BASE_URL}/api/ioc/lookup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ type, value })
  });
  return response.json();
};

export const bulkLookup = async (iocs) => {
  const response = await fetch(`${BASE_URL}/api/ioc/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ iocs })
  });
  return response.json();
};

export const getDashboardStats = async () => {
  const response = await fetch(`${BASE_URL}/api/ioc/stats`);
  return response.json();
};

export const getAllIOCs = async (filters = {}) => {
  const { type, severity, status, search, page = 1, limit = 10 } = filters;
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (severity) params.append("severity", severity);
  if (status) params.append("status", status);
  if (search) params.append("search", search);
  params.append("page", page);
  params.append("limit", limit);

  const response = await fetch(`${BASE_URL}/api/ioc?${params.toString()}`);
  return response.json();
};

export const getIOCById = async (id) => {
  const response = await fetch(`${BASE_URL}/api/ioc/${id}`);
  return response.json();
};

export const updateIOC = async (id, data, analystName = "Analyst") => {
  const response = await fetch(`${BASE_URL}/api/ioc/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-analyst-name": analystName
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

export const deleteIOC = async (id) => {
  const response = await fetch(`${BASE_URL}/api/ioc/${id}`, {
    method: "DELETE"
  });
  return response.json();
};

export const exportReportUrl = (id, format) => {
  return `${BASE_URL}/api/ioc/${id}/export?format=${format}`;
};
