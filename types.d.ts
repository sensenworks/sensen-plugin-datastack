
declare type DataStackServiceMethods = 'GET' | 'POST' | 'PUT' | 'OPTIONS' | 'PATCH' | 'DISPATCH' | 'HEAD' | 'DELETE' | 'CONNECT' | 'TRACE' | 'TOGGLE'


declare type DataStackServiceOutput = '-arraybuffer' | '-blob' | '-text' | '-formdata' | '-json'

declare type DataStackServiceType = 'ggn' | /* 'wordpress' | */ 'custom'


declare type DataStackServiceSettings = {
    Provider?: string;
    NativeProvider?: string;
    Lang: string;
    APIKey: string;
    AppiD?: string;
    Version?: string;
    PiD?: number;
    Type?: DataStackServiceType
}

declare type DataStackServiceOptions = RequestInit & { }


declare type DataStackServiceEvents<T extends DataStackServiceResponseData> = {
    Complete?: (response: T) => void;
    Success: (response: T) => void;
    Fail?: (response: T) => void;
    Error?: (response: T) => void;
}

declare type DataStackServiceResponseData = {
    [K: string] : any
}


declare type DataStackServiceProps<T> =  DataStackServiceEvents<T> & {
    Name: string;
    Data?: DataStackServiceResponseData;
    FormData?: FormData;
    Method?: DataStackServiceMethods;
    Output?: DataStackServiceOutput;
    ContentType?: string;
    Headers?: { [K: string] : string };
    CustomUrl?: string;
}


declare type DataStackServiceFeatures<T> = DataStackServiceProps<T> & {
    Response?: Response;
    Options?: DataStackServiceOptions;
    Cache?: RequestCache;
    Credentials?: RequestCredentials;
    Redirect?: RequestRedirect;
    ReferrerPolicy?: ReferrerPolicy;
    Url?: string;
    Listener?: Response;
    Handler?: Promise<any>;
    FormData?: FormData;
}
