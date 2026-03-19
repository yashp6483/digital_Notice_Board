import React from 'react'
import { Card } from 'react-bootstrap'

export default function StateCards({ title, value, bg }) {
    return (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
            <Card className={`bg-${bg} text-white shadow-sm h-100 border-0`}>
                <Card.Body className="d-flex flex-column justify-content-between">

                    <Card.Title className="fw-semibold fs-6 fs-sm-5">
                        {title}
                    </Card.Title>

                    <h2 className="fw-bold display-6 display-md-5 display-lg-4">
                        {value}
                    </h2>

                </Card.Body>
            </Card>
        </div>
    )
}
