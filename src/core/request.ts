export default class Request{
    RequestUrl: string;
    ModulePath: string;
    Fragments:Fragment[];
    Folder?: string;
    Access: boolean = true;
    View?: any;

    constructor(){
        this.Fragments = [];
    }
}
export class Fragment{
    Name:string;
    Value:string;
}