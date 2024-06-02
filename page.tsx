'use client';
import { useState,useEffect } from 'react';
 



export default function Home() {
  const s : string  = 'itay';
  const s2 : string = 'amit';
  let i = 3;
  useEffect(()=> console.log("'rendered'"));
  const [name,setName] = useState(s);
  const handleClick = () =>{
    if(name === s)
    setName(s2);
    else
     setName(s);
  }
  return (
    <div><title>hello!</title><h1><strong>{name} </strong>mamaello</h1><h2><button onClick={handleClick}>click me</button></h2></div>
  );
}

