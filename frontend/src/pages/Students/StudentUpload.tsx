import { Section } from "../../components/common/Section-input";
import { Input } from "../../components/common/Input";
import { useStudentStore } from "../../store/studentStore";
import { useUploadStudent } from "../../hooks/studentQuery";
import { classOptions } from "../../api/types";
import { SelectInput } from "../../components/common/selectorInput";

export default function StudentUploadPage() {
    const { setField, studentForm } = useStudentStore();
    const { mutate: createStudentApi } = useUploadStudent();
    const handleChange = (e: any) => {
        setField(e.target.name, e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        createStudentApi(studentForm);
    };

    return (
        <div className="p-6" style={{ background: "var(--bg-primary)" }}>
            <div
                className="rounded-2xl shadow p-6"
                style={{ background: "var(--card-bg)", color: "var(--text-primary)" }}
            >
                <h1 className="text-xl font-bold mb-4">Single Student Upload</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Details */}
                    <Section title="Personal Details">
                        <div className="grid grid-cols-2 gap-4">
                            <Input name="name" label="Name" required onChange={handleChange} />
                            <Input required name="admissionNo" label="Admission No" onChange={handleChange} />
                            <Input required name="rollNo" label="Roll No" onChange={handleChange} />
                            <Input required name="section" label="Section" onChange={handleChange} />
                            <SelectInput
                                name="class"
                                label="Class"
                                required
                                options={classOptions}
                                onChange={handleChange}
                            />
                            <Input required name="session" label="Session" onChange={handleChange} />
                            <Input required name="gender" label="Gender" onChange={handleChange} />
                            <Input required type="date" name="dob" label="Date of Birth" onChange={handleChange} />
                            <Input name="aadhaar" label="Aadhaar" onChange={handleChange} />
                            <Input name="studentMobile" label="Mobile" onChange={handleChange} />
                            <Input name="studentEmail" label="Email" onChange={handleChange} />
                            <Input name="citizenship" label="Citizenship" onChange={handleChange} />
                        </div>
                    </Section>

                    {/* Previous Education */}
                    <Section title="Previous Education">
                        <div className="grid grid-cols-2 gap-4">
                            <Input name="previousSchoolName" label="School Name" onChange={handleChange} />
                            <Input name="previousClassPassed" label="Class Passed" onChange={handleChange} />
                            <Input name="previousClassMarks" label="Marks" onChange={handleChange} />
                            <Input name="previousClassYear" label="Year" onChange={handleChange} />
                            <Input name="previousBoard" label="Board" onChange={handleChange} />
                        </div>
                    </Section>

                    {/* Address */}
                    <Section title="Address">
                        <div className="grid grid-cols-2 gap-4">
                            <Input name="permanentAddress" label="Permanent Address" onChange={handleChange} />
                            <Input name="temporaryAddress" label="Temporary Address" onChange={handleChange} />
                        </div>
                    </Section>

                    {/* Father Details */}
                    <Section title="Father Details">
                        <div className="grid grid-cols-2 gap-4">
                            <Input required name="fatherName" label="Name" onChange={handleChange} />
                            <Input required name="fatherOccupation" label="Occupation" onChange={handleChange} />
                            <Input name="fatherEmail" label="Email" onChange={handleChange} />
                            <Input required name="fatherMobile" label="Mobile" onChange={handleChange} />
                            <Input name="fatherAadhaar" label="Aadhaar" onChange={handleChange} />
                            <Input name="fatherPan" label="PAN" onChange={handleChange} />
                            <Input name="fatherPassport" label="Passport" onChange={handleChange} />
                        </div>
                    </Section>

                    {/* Mother Details */}
                    <Section title="Mother Details">
                        <div className="grid grid-cols-2 gap-4">
                            <Input required name="motherName" label="Name" onChange={handleChange} />
                            <Input name="motherOccupation" label="Occupation" onChange={handleChange} />
                            <Input name="motherEmail" label="Email" onChange={handleChange} />
                            <Input name="motherMobile" label="Mobile" onChange={handleChange} />
                            <Input name="motherAadhaar" label="Aadhaar" onChange={handleChange} />
                            <Input name="motherPan" label="PAN" onChange={handleChange} />
                            <Input name="motherPassport" label="Passport" onChange={handleChange} />
                        </div>
                    </Section>

                    {/* Fees */}
                    <Section title="Fee Details">
                        <div className="grid grid-cols-2 gap-4">
                            <Input type="number" name="discount" label="Discount" onChange={handleChange} />
                            <Input type="number" name="lateFine" label="Late Fine" onChange={handleChange} />
                            <Input type="number" name="currentYearTotal" label="Current Year Total" onChange={handleChange} />
                            <Input type="number" name="currentYearTotalPaid" label="Current Year Total Paid" onChange={handleChange} />
                            <Input type="number" name="currentYearTotalBalance" label="Current Year Total Balance" onChange={handleChange} />
                            <Input type="number" name="lastYearTotal" label="Last Year Total" onChange={handleChange} />
                            <Input type="number" name="lastYearTotalPaid" label="Last Year Total Paid" onChange={handleChange} />
                            <Input type="number" name="lastYearTotalBalance" label="Last Year Total Balance" onChange={handleChange} />
                            <Input name="remark" label="Remark" onChange={handleChange} />
                        </div>
                    </Section>

                    <button
                        type="submit"
                        className="px-4 py-2 rounded-lg font-medium"
                        style={{
                            background: "var(--accent-primary)",
                            color: "#fff",
                        }}
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}

