import React, { useState } from "react";
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import Popup from "./Popup";

const UsersQueue = () => {
  const buildArray = (cnt) => {
    var arr = [];

    for (let i = 0; i <= cnt; i++) {
      arr.push({ value: i, label: i });
    }

    return arr;
  };

  const buildHourOptions = () => {
    return buildArray(23);
  };

  const buildMinuteOptions = () => {
    return buildArray(59);
  };

  const location = useLocation();

  const [users, setUser] = useState([]);
  const [salonUserId, setsalonUserId] = useState(0);
  const [userName, setuserName] = useState(0);

  const [hourValues, sethourValues] = useState(buildHourOptions());
  const [hourSelValue, sethourSelValue] = useState(0);

  const [minuteValues, setminuteValues] = useState(buildMinuteOptions());
  const [minuteSelValue, setminuteSelValue] = useState(0);

  const [isDisplay, setisDisplay] = useState(false);

  const [addEdit, setaddEdit] = useState(1);

  const [salonQueueId, setsalonQueueId] = useState(1);

  const [showPopup, setshowPopup] = useState(false);
  const [salonUserPopupData, setsalonUserPopupData] = useState({
    username: "",
    createdTime: "",
    arriveTime: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    debugger;
    setsalonUserId(+location.state[0]);
    setuserName(location.state[1]);
  }, []);

  const loadUsers = async () => {
    try {
      const result = await axios.get(
        "http://localhost:60567/api/salon/GetSalonUsers/2020-12-25T00:00:00"
      );
      setUser(result.data.reverse());
    } catch (error) {
      console.error(error);
    }
  };

  const checkUserInQueue = () => {
    let user_selected = users.find((x) => x.salonUserId === salonUserId);
    if (user_selected) return true;
    return false;
  };

  const deleteUserFromQueue = async (salonUserId) => {
    try {
      await axios.delete(
        `http://localhost:60567/api/salon/RemoveUserFromQueue/${salonUserId}`
      );
      setaddEdit(1); //for add
      loadUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const hourChange = (e) => {
    sethourSelValue(e.target.value);
  };

  const minuteChange = (e) => {
    setminuteSelValue(e.target.value);
  };

  function pad(num, size) {
    let s = num + "";
    if (num < 10) {
      while (s.length < size) s = "0" + s;
    }
    return s;
  }

  function getIsoDate(hour, minute) {
    let separator = "-";
    let separatorBlank = " ";
    let separatorColon = ":";

    let newDate = new Date();
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();

    let dt = `${year}${separator}${
      month < 10 ? `0${month}` : `${month}`
    }${separator}${date}${separatorBlank}${hour}${separatorColon}${minute}`;

    let dtISO = new Date(dt).toISOString();
    return dtISO;
  }

  const saveUserToQueue = async () => {
    debugger;

    let hour = pad(hourSelValue);
    let minute = pad(minuteSelValue);
    let dtISO = getIsoDate(hour, minute);

    const salonQueue = {
      //SalonQueueId: 0,
      SalonUserId: salonUserId,
      ArriveTime: dtISO,
    };

    let lnk = "http://localhost:60567/api/salon/AddUserToQueue";
    if (addEdit === 1) {
      try {
        await axios.post(lnk, salonQueue);
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        lnk = `http://localhost:60567/api/salon/UpdateUserInQueue/${salonQueueId}`;
        await axios.put(lnk, salonQueue);
      } catch (error) {
        console.error(error);
      }
    }

    loadUsers();
  };

  const addUser = () => {
    debugger;
    sethourSelValue(0);
    setminuteSelValue(0);

    setaddEdit(1);
    setisDisplay(true);
  };

  const updateUser = (salonUserId) => {
    debugger;

    let user_selected = users.find((x) => x.salonUserId === salonUserId);
    setsalonQueueId(user_selected.salonQueueId);

    let time = user_selected.arriveTime.split(" ")[1];
    let hour = time.split(":")[0];
    let minute = time.split(":")[1];

    sethourSelValue(hour);
    setminuteSelValue(minute);

    setaddEdit(2);
    setisDisplay(true);
  };

  const hide = () => {
    setisDisplay(false);
  };

  const displayPopup = (salonUserId) => {
    debugger;
    setshowPopup(true);
    let user_selected = users.find((x) => x.salonUserId === salonUserId);
    const data = {
      username: user_selected.userName,
      createdTime: user_selected.createdTime,
      arriveTime: user_selected.arriveTime,
    };

    setsalonUserPopupData(data);
  };

  const togglePopup = () => {
    setshowPopup(!showPopup);
  }

  const populateTable = (user, index) => (
    <tr onClick={() => displayPopup(user.salonUserId)}>
      <th scope="row">{index + 1}</th>
      <td>{user.salonUserId}</td>
      <td>{user.userName}</td>
      <td>{user.userFirstName}</td>
      <td>{user.createdTime}</td>
      <td>{user.arriveTime}</td>
      <td>
        {user.salonUserId === salonUserId ? (
          <Link
            to="#"
            className="btn btn-primary mr-2"
            onClick={() => updateUser(user.salonUserId)}
          >
            Edit
          </Link>
        ) : (
          ""
        )}
      </td>
      <td>
        {user.salonUserId === salonUserId ? (
          <Link
            to="#"
            className="btn btn-primary mr-2"
            onClick={() => deleteUserFromQueue(user.salonUserId)}
          >
            Delete
          </Link>
        ) : (
          ""
        )}
      </td>
    </tr>
  );

  return (
    <div className="container">
      <div className="w-75 mx-auto shadow p-5">
        <h1 className="text-center mb-4">Hello, {userName} </h1>
        <h2 className="text-center mb-4">Users in Queue</h2>

        <table className="table border shadow w-auto">
          <thead className="thead-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Id</th>
              <th scope="col">User Name</th>
              <th scope="col">First Name</th>
              <th scope="col">Created Time</th>
              <th scope="col">Arrived Time</th>
              <th scope="col"></th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              return populateTable(user, index);
            })}
          </tbody>
        </table>

        {!checkUserInQueue() ? (
          <Link
            to="#"
            className="btn btn-primary mr-2"
            onClick={() => addUser()}
          >
            Add
          </Link>
        ) : (
          ""
        )}

        {isDisplay && (
          <React.Fragment>
            <div className="mt-4">
              <label className="mr-2">Hours</label>

              <select
                className="mr-2"
                value={hourSelValue}
                onChange={hourChange}
              >
                {hourValues.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <label className="mr-2">Minutes</label>
              <select
                className="mr-2"
                value={minuteSelValue}
                onChange={minuteChange}
              >
                {minuteValues.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <Link
                to="#"
                className="btn btn-primary mr-2"
                onClick={() => saveUserToQueue()}
              >
                Save
              </Link>

              <Link
                to="#"
                className="btn btn-primary mr-2"
                onClick={() => hide()}
              >
                Hide
              </Link>
            </div>
          </React.Fragment>
        )}

        {showPopup ? <Popup salonUserPopupData={salonUserPopupData} closePopup={togglePopup} /> : ""}

      </div>
    </div>
  );
};

export default UsersQueue;
