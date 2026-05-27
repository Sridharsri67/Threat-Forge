const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
    text: { type: String, required: true },
    analyst: { type: String, default: "Analyst" },
    createdAt: { type: Date, default: Date.now }
});

const IOCSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ["ip", "domain", "url", "hash"]
        },
        value: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        severity: {
            type: String,
            enum: ["Critical", "High", "Medium", "Low", "Informational"],
            default: "Informational"
        },
        status: {
            type: String,
            enum: ["active", "false_positive", "whitelisted"],
            default: "active"
        },
        virustotal: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        otx: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        abuseipdb: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        shodan: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        tags: [
            {
                type: String,
                trim: true
            }
        ],
        notes: [NoteSchema]
    },
    {
        timestamps: true
    }
);

// Add index on type and value for faster queries
IOCSchema.index({ type: 1, value: 1 });

module.exports = mongoose.model("IOC", IOCSchema);
