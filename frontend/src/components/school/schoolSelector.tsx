import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  import { useSchoolStore } from "@/store/schoolStore";
import { parseUrl } from "@/lib/utils";
  
  export const SchoolSelect = ({isLoading}:{isLoading:boolean}) => {
    const { schools, setActiveSchool } = useSchoolStore();
    console.log("school is loading", isLoading);
  
    if (isLoading) return <div>Loading...</div>;
  
    return (
      <Select onValueChange={(id) => {
        const school = schools.find((schl) => schl.id === id);
        if (school) setActiveSchool(school);
      }}>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select a school" />
        </SelectTrigger>
        <SelectContent>
          {schools.map((school) => (
            <SelectItem key={school.id} value={school.id}>
              <div className="flex items-center gap-2">
                {school.logo && (
                  <img
                    src={parseUrl(school.logo)}
                    alt={school.name}
                    className="h-5 w-5 rounded-full"
                  />
                )}
                {school.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };
  