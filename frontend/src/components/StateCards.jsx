import React from 'react'
import { Card } from 'react-bootstrap'

export default function StateCards() {
    return (
        <div className='row mt-4'>
            <div className="col-12 col-md-6 col-lg-3 mb-4">
                <Card>
                    <Card.Body className='bg-primary bg-opacity-75 rounded text-white'>
                        <Card.Title className='fw-bold mb-3'>Total Notice</Card.Title>
                        <Card.Text className='display-4 fw-bold'>120</Card.Text>
                    </Card.Body>
                </Card>
            </div>
            <div className="col-12 col-md-6 col-lg-3 mb-4">
                <Card>
                    <Card.Body className='bg-info bg-opacity-75 rounded text-white'>
                        <Card.Title className='fw-bold mb-3'>Total Professors</Card.Title>
                        <Card.Text className='display-4 fw-bold'>120</Card.Text>
                    </Card.Body>
                </Card>
            </div>
            <div className="col-12 col-md-6 col-lg-3 mb-4">
                <Card>
                    <Card.Body className='bg-warning  bg-opacity-75 rounded text-white'>
                        <Card.Title className='fw-bold mb-3'>Total Student</Card.Title>
                        <Card.Text className='display-4 fw-bold'>120</Card.Text>
                    </Card.Body>
                </Card>
            </div>
            <div className="col-12 col-md-6 col-lg-3 mb-4">
                <Card>
                    <Card.Body className='bg-success  bg-opacity-75 rounded text-white'>
                        <Card.Title className='fw-bold mb-3'>Reports</Card.Title>
                        <Card.Text className='display-4 fw-bold'>120</Card.Text>
                    </Card.Body>
                </Card>
            </div>
           
        </div>
    )
}
