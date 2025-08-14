
export const CodeShare = ({code}: {code:string}) => {
    return <div className="bg-zinc-800 rounded mx-3 text-center p-4 font-mono">
        <div className="font-noraml text-sm text-slate-300 ml-3 mb-2 tracking-wider">
            {"Share this code with your friend"}
        </div>
        <div className="font-bold text-xl"> 
            {code}
        </div>
    </div>
}