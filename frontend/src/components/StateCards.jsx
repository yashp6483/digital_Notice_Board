import React from 'react'
import { Card } from 'react-bootstrap'

export default function StateCards({ title, value, bg }) {
    return (
        <div className="col-12 col-sm-6 col-lg-3">
            <Card className={`bg-${bg} text-white shadow-sm h-100`}>
                <Card.Body>
                    <Card.Title className="fw-semibold">{title}</Card.Title>
                    <h2 className="fw-bold">{value}</h2>
                </Card.Body>
            </Card>
        </div>
    )
}
