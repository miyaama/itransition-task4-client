import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Table, Space } from "antd";
import { DeleteOutlined, UnlockOutlined } from "@ant-design/icons";

import { IS_LOGIN_LOCAL_STORAGE } from "../../constants";

const columns = [
  {
    title: "ID",
    dataIndex: "id",
  },
  {
    title: "Name",
    dataIndex: "name",
  },
  {
    title: "Email",
    dataIndex: "email",
  },
  {
    title: "Registration date",
    dataIndex: "registration",
  },
  {
    title: "Last login date",
    dataIndex: "login",
  },
  {
    title: "Status",
    dataIndex: "status",
  },
];

const UsersPage = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem(IS_LOGIN_LOCAL_STORAGE));

  const currentUserId = userData?.id;

  const [users, setUsers] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const loadUsers = async () => {
    const response = await axios.get(
      "https://itransition-task4-server.herokuapp.com/api/get"
    );
    setUsers(response.data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const logOut = () => {
    localStorage.setItem(IS_LOGIN_LOCAL_STORAGE, "{}");
    navigate("/");
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const deleteUser = (id) => {
    let newUsers = [...users];

    id.forEach((currentId) => {
      axios.delete(
        `https://itransition-task4-server.herokuapp.com/api/remove/${currentId}`
      );
      newUsers = newUsers.filter((user) => user.id !== currentId);
    });
    setUsers(newUsers);
    id.forEach((userId) => {
      if (userId === currentUserId) {
        navigate("/");
      }
    });
  };

  const unblockedUser = (id) => {
    let newUsers = [...users];

    id.forEach((currentId) => {
      newUsers = newUsers.map((user) => {
        let status = user.status;
        if (user.id === currentId) {
          status = "active";
        }
        return { ...user, status };
      });
      axios.put(
        `https://itransition-task4-server.herokuapp.com/api/update/${currentId}`,
        {
          status: "active",
        }
      );
    });
    console.log("newUsers: ", newUsers);
    setUsers(newUsers);
  };
  console.log(users);
  const blockedUser = (id) => {
    let newUsers = [...users];
    id.forEach((currentId) => {
      axios.put(
        `https://itransition-task4-server.herokuapp.com/api/update/${currentId}`,
        {
          status: "blocked",
        }
      );
      newUsers = newUsers.map((user) => {
        let status = user.status;
        if (user.id === currentId) {
          status = "blocked";
        }
        return { ...user, status };
      });
    });
    setUsers(newUsers);
    id.forEach((userId) => {
      if (userId === currentUserId) {
        navigate("/");
      }
    });
  };

  return (
    <div style={{ padding: "30px" }}>
      <div style={{ textAlign: "end" }}>
        <Button onClick={logOut}>Выйти</Button>
      </div>
      <h1 style={{ padding: "15px" }}>Users list</h1>
      <div style={{ textAlign: "start" }}>
        <Space size="small">
          <Button onClick={() => blockedUser(selectedRowKeys)}>
            Block user
          </Button>
          <UnlockOutlined
            onClick={() => unblockedUser(selectedRowKeys)}
            style={{ fontSize: "20px" }}
          />
          <DeleteOutlined
            onClick={() => deleteUser(selectedRowKeys)}
            style={{ fontSize: "20px" }}
          />
        </Space>
      </div>

      <div>
        <div
          style={{
            marginBottom: 25,
          }}
        ></div>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={users.map((user) => ({ ...user, key: user.id }))}
        />
      </div>
    </div>
  );
};

export default UsersPage;
