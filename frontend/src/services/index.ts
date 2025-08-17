interface Option {
    value: string;
    label: string;
  }

function generateSessions(yearsAhead: number = 5): Option[] {
    const currentYear = new Date().getFullYear();
    const sessions: Option[] = [];
  
    for (let i = 0; i < yearsAhead; i++) {
      const startYear = currentYear + i;
      const endYear = startYear + 1;
      sessions.push({value:`${startYear}-${endYear}`, label:`${startYear}-${endYear}`});
    }
    return sessions;
  }

export const academicSessions = generateSessions();