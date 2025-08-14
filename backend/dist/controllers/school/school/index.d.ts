export declare const createSchool: (req: {
    body: {
        name: string;
        address: string;
        createdById: string;
        principalId: string;
        currentSession: string;
    };
}, res: {
    status: (arg0: number) => {
        (): any;
        new (): any;
        json: {
            (arg0: {
                success: boolean;
                message: any;
            }): any;
            new (): any;
        };
    };
}) => Promise<any>;
//# sourceMappingURL=index.d.ts.map