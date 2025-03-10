import { verifyEmail } from '../../services/verification';
import { VERIFICATION_REQUIRED_FIELDS_ERROR, VERIFICATION_FAILED_ERROR } from '../../utils/constants';

describe('verifyEmail', () => {
  it('should return error when token is missing', async () => {
    const result = await verifyEmail('', 'code123');
    expect(result).toEqual({
      error: VERIFICATION_REQUIRED_FIELDS_ERROR
    });
  });

  it('should return error when code is missing', async () => {
    const result = await verifyEmail('token123', '');
    expect(result).toEqual({
      error: VERIFICATION_REQUIRED_FIELDS_ERROR
    });
  });

  it('should return error when both token and code are missing', async () => {
    const result = await verifyEmail('', '');
    expect(result).toEqual({
      error: VERIFICATION_REQUIRED_FIELDS_ERROR
    });
  });

  it('should return success for valid token and code (stubbed)', async () => {
    const result = await verifyEmail('valid-token', 'valid-code');
    expect(result).toEqual({
      success: true
    });
  });

  // TODO: Implement this test
  xit('should handle unexpected errors', async () => {
    // Mock implementation that throws an error
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error in test output
    
    // Force an error by passing invalid types
    const result = {};
    
    expect(result).toEqual({
      error: VERIFICATION_FAILED_ERROR
    });
  });
}); 