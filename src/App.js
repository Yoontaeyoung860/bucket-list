import React, { useState } from 'react';
import { StatusBar, Dimensions } from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native';
import { theme } from './theme';
import Input from './components/Input';
import Task from './components/Task';
import AppLoading from 'expo-app-loading';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Container = styled.SafeAreaView`

  flex: 1;
  background-color: ${({ theme }) => theme.background};
  align-items: center;
  justify-content: flex-start;
`;
const Title = styled.Text`
  font-size: 40px;
  font-weight: 600;
  color: ${({ theme }) => theme.text1}; // 변경된 부분
  align-self: flex-start;
  margin: 20px;
`;
const List = styled.ScrollView`
  flex: 1;
  width: ${({ width }) => width - 40}px;
`;
const Footer = styled.View`
  border-top-width: 1px;
  border-color: ${({ theme }) => theme.text};
  width: ${({ width }) => width}px;
  padding: 10px 0;
  flex-direction: row;
  justify-content: center;
`;

const DeleteAllButton = styled.Button.attrs({
  title: '완료 항목 일괄 삭제',
})`
  color: ${({ theme }) => theme.done};
`;
export default function App() {
  //const width = Dimensions.get('window').width는 현재 창의 너비를 width 변수에 할당하는 것
  const width = Dimensions.get('window').width;

  const [isReady, setIsReady] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState({});
 
  //tasks를 AsyncStorage에 저장.
  const _saveTasks = async tasks => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      setTasks(tasks);
    } catch (e) {
      console.error(e);
    }
  };
  // AsyncStorage에서 tasks를 가져와 state에 저장.
  const _loadTasks = async () => {
    const loadedTasks = await AsyncStorage.getItem('tasks');
    setTasks(JSON.parse(loadedTasks || '{}'));
  };
  //추가
  const _addTask = () => {
    const ID = Date.now().toString();
    const newTaskObject = {
      [ID]: { id: ID, text: newTask, completed: false },
    };
    setNewTask('');
    _saveTasks({ ...tasks, ...newTaskObject });
  };
  //삭제
  const _deleteTask = id => {
    const currentTasks = Object.assign({}, tasks);
    delete currentTasks[id];
    _saveTasks(currentTasks);
  };

  //완료 여부
  const _toggleTask = id => {
    const currentTasks = Object.assign({}, tasks);
    currentTasks[id]['completed'] = !currentTasks[id]['completed'];
    _saveTasks(currentTasks);
  };

  //update 함수
  const _updateTask = item => {
    const currentTasks = Object.assign({}, tasks);
    currentTasks[item.id] = item;
    _saveTasks(currentTasks);
  };
 // Input Componet text가 Change되었을 때 실행되는 함수.
  const _handleTextChange = text => {
    setNewTask(text);
  };
  //Input Component에서 focus가 해제되었을 때 실행.
  const _onBlur = () => {
    setNewTask('');
  };

  //완료된 항목들 모두 삭제하기
const _deleteAllCompletedTasks = () => {
  const currentTasks = Object.assign({}, tasks);
  Object.keys(currentTasks).forEach(key => {
    if (currentTasks[key].completed === true) {
      delete currentTasks[key];
    }
  });
  _saveTasks(currentTasks);
};
  return isReady ? (
    <ThemeProvider theme={theme}>
      <Container>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.background}
        />
        <Title>버킷 리스트</Title>
        <Input
          placeholder="+ 항목추가"
          value={newTask}
          onChangeText={_handleTextChange}
          onSubmitEditing={_addTask}
          onBlur={_onBlur}
        />
        <List width={width}>
          {Object.values(tasks)
            .reverse()
            .map(item => (
              <Task
                key={item.id}
                item={item}
                deleteTask={_deleteTask}
                toggleTask={_toggleTask}
                updateTask={_updateTask}
              />
            ))}
        </List>
        <Footer width={width}>
          <DeleteAllButton onPress={_deleteAllCompletedTasks} />
        </Footer>
      </Container>
    </ThemeProvider>
  ) : (
    <AppLoading
      startAsync={_loadTasks}
      onFinish={() => setIsReady(true)}
      onError={console.error}
    />
  )}


