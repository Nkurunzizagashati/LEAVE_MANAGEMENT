import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendLeaveRequestStatusEmail = async (userEmail, status, requestDetails, managerName) => {
  const { startDate, endDate, leaveType, reason } = requestDetails;
  
  const subject = status === 'approved' 
    ? 'Leave Request Approved' 
    : 'Leave Request Rejected';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${status === 'approved' ? '#28a745' : '#dc3545'};">${subject}</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
        <h3>Leave Request Details:</h3>
        <p><strong>Type:</strong> ${leaveType}</p>
        <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> ${new Date(endDate).toLocaleDateString()}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Status:</strong> ${status.toUpperCase()}</p>
        <p><strong>Processed by:</strong> ${managerName}</p>
        ${status === 'rejected' ? `<p><strong>Rejection Reason:</strong> ${requestDetails.rejectionReason}</p>` : ''}
      </div>

      <p style="margin-top: 20px;">
        You can view the full details of your leave request in the system.
      </p>

      <div style="margin-top: 30px; font-size: 12px; color: #6c757d;">
        <p>This is an automated message, please do not reply directly to this email.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: subject,
      html: html
    });
    console.log(`Email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw the error, just log it
    // This way, if email fails, the leave request status update still succeeds
  }
};

export const sendLeaveRequestNotificationToManager = async (managerEmail, employeeName, requestDetails) => {
  const { startDate, endDate, leaveType, reason, numberOfDays } = requestDetails;
  
  const subject = 'New Leave Request Requires Your Approval';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #007bff;">New Leave Request from ${employeeName}</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
        <h3>Leave Request Details:</h3>
        <p><strong>Employee:</strong> ${employeeName}</p>
        <p><strong>Type:</strong> ${leaveType}</p>
        <p><strong>Duration:</strong> ${numberOfDays} days</p>
        <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> ${new Date(endDate).toLocaleDateString()}</p>
        <p><strong>Reason:</strong> ${reason}</p>
      </div>

      <div style="margin-top: 20px; text-align: center;">
        <p>Please review and take action on this leave request in the system.</p>
        <a href="${process.env.FRONTEND_URL}/leave-requests" 
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Review Request
        </a>
      </div>

      <div style="margin-top: 30px; font-size: 12px; color: #6c757d;">
        <p>This is an automated message, please do not reply directly to this email.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: managerEmail,
      subject: subject,
      html: html
    });
    console.log(`Manager notification email sent successfully to ${managerEmail}`);
  } catch (error) {
    console.error('Error sending manager notification email:', error);
    // Don't throw the error, just log it
  }
}; 