import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container
} from '@mui/material';

interface Course {
  id: number;
  name: string;
  fee: number;
}

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({ name: '', fee: 0 });
  const [isEditing, setIsEditing] = useState(false);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCourse(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentCourse({ name: '', fee: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/api/courses/${currentCourse.id}`, currentCourse);
      } else {
        await axios.post('/api/courses', currentCourse);
      }
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Failed to save course:', error);
    }
  };

  const handleEdit = (course: Course) => {
    setIsEditing(true);
    setCurrentCourse(course);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`/api/courses/${id}`);
        fetchCourses();
      } catch (error) {
        console.error('Failed to delete course:', error);
      }
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Course & Fee Management</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
        <Typography variant="h6">{isEditing ? 'Edit Course' : 'Add New Course'}</Typography>
        <TextField
          label="Course Name"
          name="name"
          value={currentCourse.name}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Fee"
          name="fee"
          type="number"
          value={currentCourse.fee}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained">{isEditing ? 'Update' : 'Save'}</Button>
        <Button onClick={resetForm} sx={{ ml: 1 }}>Cancel</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>Fee</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map(course => (
              <TableRow key={course.id}>
                <TableCell>{course.id}</TableCell>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.fee}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(course)} sx={{ mr: 1 }}>Edit</Button>
                  <Button color="error" onClick={() => handleDelete(course.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default CourseManagement;
