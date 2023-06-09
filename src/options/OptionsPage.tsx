import React, { useState, useEffect, ChangeEvent, MouseEvent } from "react";
import { v4 as uuidv4 } from 'uuid';
import { fetchBlueListData, isURL } from "../utils";

enum INPUT {
    TEXT,
    NUMBER
}

export default function OptionsPage() {
    const [fromHours, setFromHours] = useState<string>("");
    const [fromMinutes, setFromMinutes] = useState<string>("");
    const [toHours, setToHours] = useState<string>("");
    const [toMinutes, setToMinutes] = useState<string>("");
    const [fromHoursPlaceHolder, setFromHoursPlaceHolder] = useState<string>("");
    const [fromMinutesPlaceHolder, setFromMinutesPlaceHolder] = useState<string>("");
    const [toHoursPlaceHolder, setToHoursPlaceHolder] = useState<string>("");
    const [toMinutesPlaceHolder, setToMinutesPlaceHolder] = useState<string>("");
    const [weekdayBtnState, setWeekdayBtnState] = useState<boolean[]>([]);
    const [blueListURLs, setBLueListURLS] = useState<string[]>([]);
    const [isInvalidEntry, setIsInvalidEntry] = useState<boolean>(false);
    const [redirectURL, setRedirectURL] = useState<string>("");
    const [redirectURLPlaceholder, setRedirectURLPlaceholder] = useState<string>("");
    const [isInvalidRedirectURL, setIsInvalidRedirectURL] = useState<boolean>(false);
    const [selectedURLS, setSelectedURLS] = useState<boolean[]>([]);

    const weekdays = ["Mon", "Tue", "Wed", "Thurs", "Fri", "Sat", "Sun"];


    const inputHandler = (e: ChangeEvent<HTMLInputElement>,
        setState: (state: string) => void,
        inputType: INPUT) => {
        e.preventDefault();
        const userInput = e.currentTarget.value;
        if (inputType === INPUT.NUMBER) {
            if ((userInput.match(/\d/g)?.length === userInput.length) || userInput === "") {
                setState(userInput);
            }
        } else {
            if ((userInput.length === userInput.length) || userInput === "") {
                setState(userInput);
            }
        }
    }


    const weekdayToggleHandler = async (e: MouseEvent<HTMLButtonElement>) => {
        const elem = e.currentTarget;
        console.log(elem);
        if (typeof(parseInt(elem.id)) === "number") {
            const index = parseInt(elem.id);
            const newBtnState = [...weekdayBtnState];
            newBtnState[index] = !newBtnState[index];
            setWeekdayBtnState([...newBtnState]);

            // need to update chrome storage
            const data = await fetchBlueListData();
            chrome.storage.sync.set({
                "blueList": {
                    timeFrom: data["blueList"].timeFrom,
                    timeTo: data["blueList"].timeTo,
                    weekdays: newBtnState,
                    urls: data["blueList"].urls,
                    redirectURL: data["blueList"].redirectURL
                }
            });
        }
        
    }


    const invalidEntryHandler = (
        handler: (value: React.SetStateAction<boolean>) => void
    ) => {
        handler(true);
        setTimeout(() => {
            handler(false);
        }, 3000);
    }


    const setTimeFrame = async () => {
        if (fromHours && fromMinutes && toHours && toMinutes) {
            const currentData = await fetchBlueListData();
            chrome.storage.sync.set({
                "blueList": {
                    timeFrom: `${fromHours}:${fromMinutes}`,
                    timeTo: `${toHours}:${toMinutes}`,
                    weekdays: currentData["blueList"].weekdays,
                    urls: currentData["blueList"].urls,
                    redirectURL: currentData["blueList"].redirectURL
                }
            });
            setFromHours("");
            setFromMinutes("");
            setToHours("");
            setToMinutes("");
            setFromHoursPlaceHolder(fromHours);
            setFromMinutesPlaceHolder(fromMinutes);
            setToHoursPlaceHolder(toHours);
            setToMinutesPlaceHolder(toMinutes);
        } else {
            invalidEntryHandler(setIsInvalidEntry);
        }
    }


    const redirectURLHandler = async () => {
        if (isURL(redirectURL)) {
            const currentData = await fetchBlueListData();
            console.log(currentData["blueList"].timeFrom);
            chrome.storage.sync.set({
                "blueList": {
                    timeFrom: currentData["blueList"].timeFrom,
                    timeTo: currentData["blueList"].timeTo,
                    weekdays: currentData["blueList"].weekdays,
                    urls: currentData["blueList"].urls,
                    redirectURL: redirectURL
                }
            });
            setRedirectURLPlaceholder(redirectURL);
            setRedirectURL("");
        } else {
            invalidEntryHandler(setIsInvalidRedirectURL)
        }
    }


    const deleteSelected = async () => {
        const currentData = await fetchBlueListData();
        const updatedURLs = blueListURLs.filter((url, i) => !selectedURLS[i]);
        chrome.storage.sync.set({
            "blueList": {
                timeFrom: currentData["blueList"].timeFrom,
                timeTo: currentData["blueList"].timeTo,
                weekdays: currentData["blueList"].weekdays,
                urls: [...updatedURLs],
                redirectURL: currentData["blueList"].redirectURL
            }
        });
        setBLueListURLS(updatedURLs);
        setSelectedURLS(Array.from({ length: updatedURLs.length },
            (_, i) => false));
    }


    const deleteAll = async () => {
        const currentData = await fetchBlueListData();
        await chrome.storage.sync.set({
            "blueList": {
                timeFrom: currentData["blueList"].timeFrom,
                timeTo: currentData["blueList"].timeTo,
                weekdays: currentData["blueList"].weekdays,
                urls: [],
                redirectURL: currentData["blueList"].redirectURL
            }
        });
        const res = await chrome.storage.sync.get("blueList");
        console.log(res);
        setBLueListURLS([]);
        setSelectedURLS([]);
    }


    const urlClickedHandler = (e: any) => {
        const index = e.currentTarget.getAttribute("data-id");
        const newSelectedURLS = selectedURLS;
        newSelectedURLS[index] = !selectedURLS[index];
        setSelectedURLS(selectedURLS => [...newSelectedURLS]);
    }


    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchBlueListData();
            console.log(data);
            setBLueListURLS(data["blueList"].urls);
            setSelectedURLS(Array.from({ length: data["blueList"].urls.length },
                (_, i) => false));
            setFromHoursPlaceHolder(data["blueList"].timeFrom.split(":")[0]);
            setFromMinutesPlaceHolder(data["blueList"].timeFrom.split(":")[1]);
            setToHoursPlaceHolder(data["blueList"].timeTo.split(":")[0]);
            setToMinutesPlaceHolder(data["blueList"].timeTo.split(":")[1]);
            setRedirectURLPlaceholder(data["blueList"].redirectURL);
            setWeekdayBtnState(data["blueList"].weekdays);
        }
        fetchData();
    }, []);


    return (
        <div className="flex flex-col items-center bg-[#fafafa] h-screen w-full font-openSans">
            <div className="flex md:w-2/3 h-fit w-screen my-2 p-6 flex-col gap-4">
                <div className="flex flex-col w-full md:w-2/3">
                    <h1 className="text-listBlue font-bold text-3xl">/BLUE_LIST/</h1>
                    <h2 className="text-lg text-slate-400">Settings page</h2>
                </div>
                <div className="flex flex-col">
                    <h1 className="font-bold text-[1rem]">Select your time out period</h1>
                    <hr className="mb-4"/>
                    <div className="flex flex-col gap-4 md:gap-20 md:flex-row w-full justify-start pb-2">
                        <div className="flex">
                            <label className="text-[1rem] mr-4 md:mr-2 font-bold">From</label>
                            <label className="flex gap-2 text-lg">
                                <input className={`md:w-[46px] w-2/12 px-2 border-2 text-sm bg-white rounded-sm
                                ${isInvalidEntry ? "border-red-400" : "border-slate-300"}`} type="text" maxLength={2}
                                    placeholder={fromHoursPlaceHolder} value={fromHours} onChange={(e) => {
                                        inputHandler(e, setFromHours, INPUT.NUMBER);
                                    }} /> :
                                <input className={`md:w-[46px] w-2/12 px-2 border-2 text-sm rounded-sm
                                ${isInvalidEntry ? "border-red-400" : "border-slate-300"}`} type="text" maxLength={2}
                                    placeholder={fromMinutesPlaceHolder} value={fromMinutes} onChange={(e) => {
                                        inputHandler(e, setFromMinutes, INPUT.NUMBER);
                                    }} />
                            </label>
                        </div>
                        <div className="flex">
                            <label className="text-[1rem] mr-9 md:mr-2 font-bold">To</label>
                            <label className="flex gap-2 text-lg">
                                <input className={`md:w-[46px] w-2/12 px-2 border-2 text-sm rounded-sm
                                ${isInvalidEntry ? "border-red-400" : "border-slate-300"}`} type="text" maxLength={2}
                                    placeholder={toHoursPlaceHolder} value={toHours} onChange={(e) => {
                                        inputHandler(e, setToHours, INPUT.NUMBER);
                                    }} /> :
                                <input className={`md:w-[46px] w-2/12 px-2 border-2 text-sm rounded-sm
                                ${isInvalidEntry ? "border-red-400" : "border-slate-300"}`} type="text" maxLength={2}
                                    placeholder={toMinutesPlaceHolder} value={toMinutes} onChange={(e) => {
                                        inputHandler(e, setToMinutes, INPUT.NUMBER);
                                    }} />
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-1" id="main">
                        { weekdayBtnState ? 
                            weekdayBtnState.map((weekdayState, i) => {
                                return <button key={uuidv4()} className=
                                    {`h-8 w-20 border-2 rounded-sm text-gray-500 text-md
                                    ${weekdayState ? "bg-green-400 border-green-400 text-white" : "bg-white border-slate-300"}`}
                                    onClick={weekdayToggleHandler}
                                    id={`${i}`}
                                    >{weekdays[i]}</button>
                            }): 
                            ""
                        }
                    </div>
                </div>
                <button className="bg-listBlue w-fit text-white py-1 px-2 text-[1rem] hover:brightness-[1.5] rounded-sm"
                    onClick={setTimeFrame}>Set
                </button>
                <div className="flex flex-col">
                    <h1 className="font-bold text-[1rem]">Select the page you want the extension to redirect to</h1>
                    <hr className="mb-4"/>
                    <input className={`w-full px-2 border-2 py-2 text-lg rounded-sm text-[1rem]
                        ${isInvalidRedirectURL ? "border-red-400" : "border-slate-300"}`} type="text"
                        onChange={(e) => { inputHandler(e, setRedirectURL, INPUT.TEXT) }}
                        placeholder={redirectURLPlaceholder} value={redirectURL} />
                </div>
                <button className="bg-listBlue w-fit text-white py-1 px-2 text-[1rem] hover:brightness-[1.5] rounded-sm"
                    onClick={redirectURLHandler}>Set
                </button>
                <div className="flex flex-col">
                    <h1 className="font-bold text-[1rem]">Current websites on timeout list</h1>
                    <hr className="mb-4"/>
                    <div className=" flex flex-col bg-white text-[1rem] text-gray-500 w-full min-h-[100px]
                        max-h-1/3 w-full overflow-y-auto overflow-x-auto border-2 border-slate-300 rounded-sm">
                        {(blueListURLs && blueListURLs.length > 0)
                            ? blueListURLs.map((url, i) => <a key={uuidv4()} data-id={i}
                                className={`p-1 w-full whitespace-nowrap ${selectedURLS[i] ? "bg-[#ff5454] text-white" : ""}`}
                                onClick={urlClickedHandler}>{url}</a>)
                            : <input className="px-2 py-1 bg-white text-[1rem]"
                                placeholder="Looks like you haven't added any sites to your blue list yet!" disabled></input>
                        }
                    </div>
                </div>
                <div className="flex justify-between">
                    <button className="bg-listBlue text-white py-1 px-2 text-[1rem] hover:brightness-[1.5] rounded-sm"
                        onClick={deleteSelected}>Delete</button>
                    <button className="bg-[#ff5454] text-white py-1 px-2 text-[1rem] hover:brightness-[1.5] rounded-sm"
                        onClick={deleteAll}>Clear List</button>
                </div>
            </div>
        </div>
    )
}