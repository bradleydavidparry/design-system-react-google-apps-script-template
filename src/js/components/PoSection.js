import React from 'react';
import Alert from 'react-bootstrap/Alert'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import map from 'lodash/map';
import formatMoney from '../functions/utilities';

function PoSection(props) {
    const { department } = props;
    const pos = department.pos;

    return (
        <Alert variant={'primary'}>
            <Container>
                <Row>
                    <Col className='text-center'>
                        <h4>POs</h4>
                    </Col>
                </Row>
                {map(pos,(po) => {
                    return (
                        <Row>
                            <Col>{po.PONumber}</Col>
                            <Col>{formatMoney(po.Amount,0)}</Col>
                        </Row>
                    )
                })}

            </Container>
        </Alert>
    )
}

export default PoSection;