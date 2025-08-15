import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import { useUiStore } from "../../store/useUiStore";

export default function SettingsPage() {
  const { darkMode, setDarkMode, resetTheme } = useUiStore();
  return (
    <div className="space-y-6">
      <Section title="Settings" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-primary bg-card p-4">
          <h4 className="font-semibold mb-2 text-primary">School Profile</h4>
          <form className="space-y-3">
            <div>
              <label className="text-sm text-secondary">School Name</label>
              <input className="mt-1 w-full h-10 rounded-xl border border-primary bg-transparent px-3 text-primary placeholder:text-secondary" placeholder="Springfield Public School" />
            </div>
            <div>
              <label className="text-sm text-secondary">Branch</label>
              <input className="mt-1 w-full h-10 rounded-xl border border-primary bg-transparent px-3 text-primary placeholder:text-secondary" placeholder="Main" />
            </div>
            <Button className="mt-2">Save</Button>
          </form>
        </div>
        <div className="rounded-2xl border border-primary bg-card p-4">
          <h4 className="font-semibold mb-2 text-primary">Theme</h4>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setDarkMode(false)}>Light</Button>
            <Button variant="outline" onClick={() => setDarkMode(true)}>Dark</Button>
            <Button onClick={resetTheme}>System</Button>
          </div>
          <div className="text-sm opacity-70 mt-2 text-secondary">Current: {darkMode ? "Dark" : "Light"}</div>
        </div>
      </div>
    </div>
  );
}
