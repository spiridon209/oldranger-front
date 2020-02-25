import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import { Link } from 'react-router-dom';
import serverQueries from '../../serverQueries';
import { dateToDateDistance } from '../../utils';

const AdminPanel = () => {
  const [usersList, setUsersList] = useState([]);
  const [pageParams, setPageParams] = useState({ total: 0, pageSize: 5, currentPage: 0 });

  useEffect(() => {
    serverQueries.getUsersList(0).then(({ users, usersCount }) => {
      setUsersList(users);
      setPageParams({ total: usersCount });
    });
  }, []);

  const handlepageChange = ({ current }) => {
    serverQueries.getUsersList(current - 1).then(({ users }) => {
      setUsersList(users);
    });
    setPageParams({ currentPage: current });
  };

  const columns = [
    {
      title: 'Nickname',
      dataIndex: 'nickName',
      render: (text, { userStatisticId }) => (
        <Link to={`/admin-panel/users/${userStatisticId}`}>{text}</Link>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Registered',
      dataIndex: 'registered',
      render: dt => dateToDateDistance(dt),
    },
    {
      title: 'Last visit',
      dataIndex: 'lastVizit',
      render: dt => dateToDateDistance(dt),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: roleName =>
        roleName
          .split('ROLE_')
          .join('')
          .toLowerCase(),
    },
  ];

  return (
    <div>
      <h2>Панель управления</h2>
      <Table
        rowKey="email"
        columns={columns}
        dataSource={usersList}
        pagination={pageParams}
        onChange={handlepageChange}
      />
    </div>
  );
};

export default AdminPanel;
