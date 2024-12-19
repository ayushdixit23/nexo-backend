import mongoose from "mongoose";
// Create the schema using the interface
const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilepic: {
        type: String,
    },
    organisations: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Organisation" },
    ],
    teams: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
        },
    ],
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
        },
    ],
    storage: [{ type: mongoose.Schema.Types.ObjectId, ref: "Storage" }],
    storageused: { type: Number, default: 0 }, //in Gbs
}, { timestamps: true });
// Create the model
const User = mongoose.model("User", userSchema);
export default User;
//# sourceMappingURL=user.js.map