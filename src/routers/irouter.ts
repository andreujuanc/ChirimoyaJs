export default interface IRouter {
    //new(settings: Options)
    set(route: string): Promise<any>;
}