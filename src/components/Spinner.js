import React, { Fragment } from "react";

export default function Spinner({type}){
    if(type=='table'){
    return(
        <tbody>
            <tr>
                <td className="p-0" style={{borderBottomWidth: "0px" ,textAlign: 'center' ,verticalAlign: 'center'}}>
                    <div className="d-flex justify-content-center text-light bg-dark ">
                        <div className="spinner-border" role="status"></div>
                    </div>
                </td>
            </tr>
        </tbody>
    )
    }else{
        return(
        <div className="d-flex justify-content-center text-light">
            <div className="spinner-border" role="status"></div>
        </div>
        )
    }
}
