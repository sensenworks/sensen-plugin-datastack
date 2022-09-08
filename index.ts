
// const localStorage = (typeof Window == 'object' && 'localStorage' in globalThis) ? globalThis.localStorage : {

//     setItem(name: string, value : any){},

//     getItem(name: string){},
    
// }


export default class DataStackService<T extends DataStackServiceResponseData>{

    HeadersResponses : Headers = {} as Headers;

    Settings : DataStackServiceSettings;
    

    constructor(settings: DataStackServiceSettings){

        this.Settings = settings;

        this.Settings.Provider = settings.Provider || (`${settings.NativeProvider || './'}${ this.GetTypePath(this.Settings.Type||'sensen')  }`);

        this.Settings.Lang = settings.Lang || ('Fr-fr');

    }



    GetTypePath(type : DataStackServiceType) : string{

        switch(type){

            case 'ggn': return 'ServicesAwake/';
            

            case 'wordpress': return '/wp-json/v2/';

            case 'sensen': return '/';

            default:

            case 'custom': return '';
            
        }

    }



    URLTranscriber($URL: string, $Data : T){

        Object.keys($Data).forEach(($Key)=>{

            $URL = $URL.replace(new RegExp(`%${$Key}%`, 'g'), ($Data[$Key]||'').toString() );

        });
        
        return $URL;
        
    }


    ReadFile(
        $File : File, 
        $Load: (reader: FileReader) => void, 
        $Fail: (error: ProgressEvent<FileReader>) => void, 
        $Progress:  (error: ProgressEvent<FileReader>) => void
    ){

        let $Reader = new FileReader();

        $Reader.onload = ()=>{
            
            if(typeof $Load == 'function'){ $Load($Reader); }
        
        };

        $Reader.onprogress = (ev)=>{
            
            if(typeof $Progress == 'function' && ev.lengthComputable === true){$Progress(ev);}
        
        };

        $Reader.onerror = (ev)=>{
            
            if(typeof $Fail == 'function'){$Fail(ev);}
        
        };

        $Reader.readAsDataURL($File);
        
        return this;

    }



    async Send($Features : DataStackServiceFeatures<T>){

        $Features.Response =  $Features.Response || undefined;

        $Features.Method = $Features.Method || 'GET';

        $Features.Output = $Features.Output || undefined;

        $Features.ContentType = $Features.ContentType || 'application/json;charset=utf-8';

        $Features.Options = this.SetFetchOptions($Features);

        $Features.Url = $Features.CustomUrl || this.SetFetchURL($Features);

        // console.warn('Send Fecth : ', $Features.Url, $Features.Options, this.Settings )

        $Features.Listener = await fetch($Features.Url, $Features.Options);

        $Features.Handler = this.SetFetchOutput($Features);
    
        this.SetEvents($Features);

        return $Features;

    }


    EventTrigger($Features : DataStackServiceFeatures<T>, $Name : keyof DataStackServiceEvents<T>, $Args: T){

        if(typeof $Features[$Name] == 'function'){
    
            return ($Features[$Name]||((a:T,f:DataStackServiceFeatures<T>)=>{})).apply($Features, [$Args, $Features]);

        }

        return null;

    }


    SaveLocalStorage($Data : T){

        if(typeof $Data == 'object' && typeof localStorage == 'object'){

            Object.keys($Data).forEach((k)=> localStorage.setItem(k,$Data[k]) );
            
        }

        return this;

    }

    
    ResponseParser(r : T){

        if(r && typeof localStorage == 'object'){

            if('ClientTokenID' in r){ localStorage.setItem('@ClientTokenID', r.ClientTokenID || null); }

            if('UUiD' in r){ localStorage.setItem('@UUiD', r.UUiD || null); }
                
        }
            
        return this

    }

    

    SetEvents($Features: DataStackServiceFeatures<T>){

        if($Features.Handler){
               
            $Features.Handler
    
                .then((r)=>{
    
                    $Features.Response = r;
    
                    this.ResponseParser(r)
    
                    this.EventTrigger($Features, 'Complete', r);

                    if($Features.Listener){

                        if($Features.Listener.status === 0 || $Features.Listener.status == 200){ 
        
                            if(r){ 
                                if(typeof r['Awake:Local:Storage'] == 'object'){ this.SaveLocalStorage(r['Awake:Local:Storage']); }
                            }
                            
                            (this.EventTrigger($Features, 'Success', r)); 
                        
                        }
                        
                        else if($Features.Listener.status == 404){ 
        
                            (this.EventTrigger($Features, 'Fail', {} as T)); 
                        
                        }
                        
                        else{ 
        
                            (this.EventTrigger($Features, 'Error', {} as T)); 
                        
                        }
        
                    }
        
                    return r;
    
                })
            
                .catch(($e)=>{
    
                    this.EventTrigger($Features, 'Error', $e);
    
                    throw $e
    
                })
    
            ;
     
        }
        
        return $Features;

    }


    SetFetchHeaders($Features : DataStackServiceFeatures<T>){

        let $Headers = new Headers();

        // 'Content-Type': 'application/x-www-form-urlencoded'

        $Features.Headers = Object.assign({
            
            'Content-Type':($Features.ContentType || 'application/json').toString()
            
            ,"API-KEY": this.Settings.APIKey

            ,"API-CLIENT-LANG":this.Settings.Lang

            ,"CLIENT-TOKEN-ID": (typeof localStorage == 'object') ? localStorage.getItem('@ClientTokenID')||'' : ''

            // ,"UUiD": localStorage.getItem('@UUiD')||'',

            ,"USER-AGENT": this.Settings.UserAgent||'',
        
        }, $Features.Headers)

        Object.keys($Features.Headers).forEach(($k: string)=> {

            if($Features.Headers){

                $Headers.append( $k, $Features.Headers[$k] )

            }

            
        })
        
        return $Headers;

    }


    SetFetchOptions($Features : DataStackServiceFeatures<T>) : RequestInit{

        let $Headers = this.SetFetchHeaders($Features);
        
        return {
               
            method:($Features.Method || 'GET').toUpperCase(),
            
            mode:'cors',
            
            cache: $Features.Cache||'no-cache',
            
            credentials: $Features.Credentials||'same-origin',
            
            headers: $Headers,
            
            redirect: $Features.Redirect||'follow',
            
            referrerPolicy: $Features.ReferrerPolicy||'unsafe-url'
            
        };

    }


    SetFetchURL($Features : DataStackServiceFeatures<T>){

        let $URL = $Features.Url||(`${this.Settings.Provider}${$Features.Name||''}`)


        $Features.Data = typeof $Features['Data'] == 'object' ? $Features.Data : {};

        if(this.Settings.AppiD){ $Features.Data.AppiD = this.Settings.AppiD; }

        if(this.Settings.Version){ $Features.Data.Version = this.Settings.Version; }

        if(this.Settings.PiD){ $Features.Data.PiD = this.Settings.PiD; }



        switch( ($Features.Method||'GET').toString().toUpperCase() ) {

            case 'GET':

                let $Param: string[] = [];

                if($Features.Data && typeof $Features.Data == 'object'){


                    Object.keys($Features.Data).forEach(($k)=> {

                        if( $Features.Data && (typeof $Features.Data[$k] == 'string' || typeof $Features.Data[$k] == 'number')){

                            $Param[$Param.length] = `${$k}=${encodeURIComponent($Features.Data[$k])}` 

                        }
                        
                    });

                }
                
                $URL = `${$URL}${($URL.trim().indexOf('?') >= 0 ) ? '&' : '?'}${$Param.join('&')}&send-now=done`;

            break;

            default:
    
                if($Features.Options){
                    
                    $Features.Options.body = $Features.FormData || JSON.stringify($Features.Data);
    
                }

            break;
            
        }

        return $URL;

    }



    async SetFetchOutput($Features : DataStackServiceFeatures<T>){

        this.HeadersResponses = ( $Features.Listener ) ? $Features.Listener.headers : new Headers();

        switch($Features.Output){

            case '-arraybuffer': return $Features.Listener?.arrayBuffer();
            
            case '-blob': return $Features.Listener?.blob(); 

            case '-text': return $Features.Listener?.text();

            case '-formdata': return $Features.Listener?.formData(); 

            case null: return $Features.Handler; 
            
            case '-json': default: return $Features.Listener?.json(); 

        }

    }
    


    async Get<ResponseScheme>($f: DataStackServiceProps<ResponseScheme & T>){

        $f = typeof $f == 'object' ? $f : {} as DataStackServiceProps<T>; $f.Method = 'GET';

        return await this.Send($f as DataStackServiceFeatures<T>);

    }
    


    async Post<ResponseScheme>($f: DataStackServiceProps<ResponseScheme & T>){

        $f = typeof $f == 'object' ? $f : {} as DataStackServiceProps<T>; $f.Method = 'POST';

        return await this.Send($f as DataStackServiceFeatures<T>);

    }
    


    async Put<ResponseScheme>($f: DataStackServiceProps<ResponseScheme & T>){

        $f = typeof $f == 'object' ? $f : {} as DataStackServiceProps<T>; $f.Method = 'PUT';

        return await this.Send($f as DataStackServiceFeatures<T>);

    }
    


    async Delete<ResponseScheme>($f: DataStackServiceProps<ResponseScheme & T>){

        $f = typeof $f == 'object' ? $f : {} as DataStackServiceProps<T>; $f.Method = 'DELETE';

        return await this.Send($f as DataStackServiceFeatures<T>);

    }
    


    async Toggle<ResponseScheme>($f: DataStackServiceProps<ResponseScheme & T>){

        $f = typeof $f == 'object' ? $f : {} as DataStackServiceProps<T>; $f.Method = 'TOGGLE';

        return await this.Send($f as DataStackServiceFeatures<T>);

    }
    


    async Options<ResponseScheme>($f: DataStackServiceProps<ResponseScheme & T>){

        $f = typeof $f == 'object' ? $f : {} as DataStackServiceProps<T>; $f.Method = 'OPTIONS';

        return await this.Send($f as DataStackServiceFeatures<T>);

    }
    


    async Patch<ResponseScheme>($f: DataStackServiceProps<ResponseScheme & T>){

        $f = typeof $f == 'object' ? $f : {} as DataStackServiceProps<T>; $f.Method = 'PATCH';

        return await this.Send($f as DataStackServiceFeatures<T>);

    }
    


    async Dispatch<ResponseScheme>($f: DataStackServiceProps<ResponseScheme & T>){

        $f = typeof $f == 'object' ? $f : {} as DataStackServiceProps<T>; $f.Method = 'DISPATCH';

        return await this.Send($f as DataStackServiceFeatures<T>);

    }
    


    async Head<ResponseScheme>($f: DataStackServiceProps<ResponseScheme & T>){

        $f = typeof $f == 'object' ? $f : {} as DataStackServiceProps<T>; $f.Method = 'HEAD';

        return await this.Send($f as DataStackServiceFeatures<T>);

    }
    


    async Connect<ResponseScheme>($f: DataStackServiceProps<ResponseScheme & T>){

        $f = typeof $f == 'object' ? $f : {} as DataStackServiceProps<T>; $f.Method = 'CONNECT';

        return await this.Send($f as DataStackServiceFeatures<T>);

    }
    


    async Trace<ResponseScheme>($f: DataStackServiceProps<ResponseScheme & T>){

        $f = typeof $f == 'object' ? $f : {} as DataStackServiceProps<T>; $f.Method = 'TRACE';

        return await this.Send($f as DataStackServiceFeatures<T>);

    }
    



}

