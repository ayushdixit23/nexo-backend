import mongoose from "mongoose";
// Create the schema using the interface
const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    organisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation",
        required: true,
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
        },
    ]
}, {
    timestamps: true
});
// Create the model
const Team = mongoose.model("Team", teamSchema);
export default Team;
//# sourceMappingURL=team.js.map