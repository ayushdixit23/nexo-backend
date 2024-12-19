import mongoose from "mongoose";
// Create the schema using the interface
const organisationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    dp: {
        type: String,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    moderators: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    teams: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
        },
    ],
    code: {
        type: String,
    },
    storage: [{ type: mongoose.Schema.Types.ObjectId, ref: "Storage" }],
    storageused: { type: Number, default: 0 }, //in Gbs
}, { timestamps: true });
const Organisation = mongoose.model("Organisation", organisationSchema);
export default Organisation;
//# sourceMappingURL=organistion.js.map