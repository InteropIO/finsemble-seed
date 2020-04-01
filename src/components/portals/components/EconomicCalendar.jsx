import * as React from "react"
export const Calendar = () => {
    return (
        <div className="card">
            <div className="card-title">
                Economic Calendar
            </div>
            <div className="content">
                <table>
                    <thead>
                        <tr>
                            <td>When</td>
                            <td>Currency</td>
                            <td>Event</td>
                            <td>Importance</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>22/04 10:30</td>
                            <td>USD</td>
                            <td>sed do eiusmod tempor incididunt</td>
                            <td><span className="high">High</span></td>
                        </tr>
                        <tr>
                            <td>22/04 10:30</td>
                            <td>USD</td>
                            <td>sed do eiusmod tempor incididunt</td>
                            <td><span className="medium">Medium</span></td>
                        </tr>
                        <tr>
                            <td>22/04 12:00</td>
                            <td>CAD</td>
                            <td>sed do eiusmod tempor incididunt</td>
                            <td><span className="high">High</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
