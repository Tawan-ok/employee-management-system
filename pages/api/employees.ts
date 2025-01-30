import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../lib/mongodb";
import Employee, { IEmployee } from "../../models/Employee";

type ApiResponse = { message: string } | IEmployee | IEmployee[];

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        const employees = await Employee.find({});
        return res.status(200).json(employees);
      } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
      }

    case "POST":
      try {
        const employee = await Employee.create(req.body);
        return res.status(201).json(employee);
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }

    case "PUT":
      try {
        const { id, ...data } = req.body;
        if (!id) return res.status(400).json({ message: "ID is required" });

        const updatedEmployee = await Employee.findByIdAndUpdate(id, data, { new: true });
        if (!updatedEmployee) return res.status(404).json({ message: "Employee not found" });

        return res.status(200).json(updatedEmployee);
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }

    case "DELETE":
      try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ message: "ID is required" });

        const deletedEmployee = await Employee.findByIdAndDelete(id);
        if (!deletedEmployee) return res.status(404).json({ message: "Employee not found" });

        return res.status(200).json({ message: "Employee deleted" });
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}
