interface RequestContext {
    body: any;
}
export declare function jsonPost<T = any>(handler: (args: {
    body: T;
}) => any): (ctx: RequestContext) => Promise<any>;
export {};
//# sourceMappingURL=jsonPost.d.ts.map