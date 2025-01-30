"use client";
import { useState, useEffect } from "react";
import { CSVLink } from "react-csv";

interface Employee {
  _id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
}

const csvHeaders = [
  { label: "Name", key: "name" },
  { label: "Position", key: "position" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "phone" },
];

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState({ id: "", name: "", position: "", email: "", phone: "" });
  const [editing, setEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 5;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";

    const res = await fetch("/api/employees", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ id: "", name: "", position: "", email: "", phone: "" });
      setEditing(false);
      fetchEmployees();
    }
  };

  const handleEdit = (employee: Employee) => {
    setForm({ id: employee._id, name: employee.name, position: employee.position, email: employee.email, phone: employee.phone });
    setEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    const res = await fetch("/api/employees", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) fetchEmployees();
  };

  // ✅ Filter Employees based on Search
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone.includes(searchQuery)
  );

  // ✅ Pagination Logic
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">Employee Management</h1>

      {/* ✅ Search Bar */}
      <input
        type="text"
        placeholder="Search Employee..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4 shadow-md"
      />

      {/* ✅ Form for Adding/Editing Employees */}
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-center">{editing ? "Edit Employee" : "Add Employee"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
          <input type="text" name="position" placeholder="Position" value={form.position} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
          <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
          <button type="submit" className={`w-full py-2 rounded ${editing ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"} text-white shadow-md`}>
            {editing ? "Update Employee" : "Add Employee"}
          </button>
        </form>
      </div>

      {/* ✅ Employee Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 shadow-md">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Position</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Phone</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.length > 0 ? (
              currentEmployees.map((emp, index) => (
                <tr key={emp._id} className="hover:bg-gray-100 text-center">
                  <td className="px-4 py-2 border">{index + 1 + (currentPage - 1) * employeesPerPage}</td>
                  <td className="px-4 py-2 border">{emp.name}</td>
                  <td className="px-4 py-2 border">{emp.position}</td>
                  <td className="px-4 py-2 border">{emp.email}</td>
                  <td className="px-4 py-2 border">{emp.phone}</td>
                  <td className="px-4 py-2 border flex justify-center space-x-2">
                    <button onClick={() => handleEdit(emp)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
                    <button onClick={() => handleDelete(emp._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4">No employees found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Export CSV */}
      <div className="flex justify-center mt-4">
        <CSVLink data={employees} headers={csvHeaders} filename="employees.csv">
          <button className="bg-green-500 text-white px-4 py-2 rounded shadow-md hover:bg-green-600">Export CSV</button>
        </CSVLink>
      </div>

      {/* ✅ Pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
