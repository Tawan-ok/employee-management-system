import mongoose, {Schema,Document} from "mongoose";

export interface IEmployee extends Document {
    name: string;
    position : string;
    email: string;
    phone: string;
}

const EmployeeSchema = new Schema<IEmployee>({
    name: {type: String, required: true},
    position: {type:String, require:true},
    email: {type:String, required:true, unique:true},
    phone: {type:String, required:true}
});

export default mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);