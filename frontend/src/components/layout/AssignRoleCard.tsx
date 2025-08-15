import { useState } from "react";

// components/AssignRoleCard.tsx
export default function AssignRoleCard({ role, onVerifyClick, director, principal }) {
    const [email, setEmail] = useState<string>("");
    const isVerified = role==="Director"?director.isEmailVerified:principal.isEmailVerified;
    return (
      <div className="border rounded-xl p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">
          Assign {role}
        </h2>
  
        {/* Existing User */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">
            Existing User Email
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter email"
              className="flex-1 border px-3 py-2 rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              onChange={(e)=>setEmail(e.target.value)}
            />
            <button
            disabled={isVerified}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md"
              onClick={() => onVerifyClick({ type: "email", value: email, role:role.toLowerCase()})}
            >
              Verify
            </button>
          </div>
        </div>
  
        {/* Or Create New */}
        <div className="mb-3">
          <p className="text-sm font-medium mb-1 dark:text-gray-200">Or Create New</p>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border px-3 py-2 rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            />
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 border px-3 py-2 rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              />
              <button
                className="px-3 py-2 bg-indigo-600 text-white rounded-md"
                onClick={() => onVerifyClick({ type: "email", value: `${role}_new@mail.com` })}
              >
                Verify
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="Phone"
                className="flex-1 border px-3 py-2 rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              />
              <button
                className="px-3 py-2 bg-indigo-600 text-white rounded-md"
                onClick={() => onVerifyClick({ type: "phone", value: "+91XXXXXX" })}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
  
        {/* Assign Myself */}
        <div className="flex items-center gap-2">
          <input type="checkbox" id={`${role}-self`} />
          <label htmlFor={`${role}-self`} className="text-sm dark:text-gray-300">
            Assign Myself
          </label>
        </div>
      </div>
    );
  }
  