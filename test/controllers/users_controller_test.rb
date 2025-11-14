# frozen_string_literal: true

require 'test_helper'

class UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(username: 'test', email: 'test@test.de', password: 'StrongPassword123!')
  end

  test 'return all users' do
    create_session_for @user

    get users_path

    assert_response :ok
    assert_equal @user.username, JSON.parse(response.body).first['username']
    assert_equal @user.email, JSON.parse(response.body).first['email']
    assert JSON.parse(response.body).first['active']
  end

  test 'return current user profile' do
    create_session_for @user

    get profile_path, as: :json

    assert_response :ok
    response_body = JSON.parse(response.body)
    assert_equal @user.id, response_body['id']
    assert_equal @user.username, response_body['username']
    assert_equal @user.email, response_body['email']
    assert_equal @user.active, response_body['active']
    assert_nil response_body['password_digest']
  end

  test 'create new user and return it' do
    assert_emails 1 do
      post users_path,
           params: { user: { username: 'test2', email: 'test2@test.de', password: 'ValidPassword123!', password_confirmation: 'ValidPassword123!' } }, as: :json
      assert_response :created
    end

    assert_equal 'test2@test.de', JSON.parse(response.body)['email']
    assert_equal 'test2', JSON.parse(response.body)['username']
    assert JSON.parse(response.body)['password_digest']
    assert JSON.parse(response.body)['active']
  end

  test 'delete new user' do
    create_session_for @user

    delete users_path

    assert_response :no_content
    assert_nil User.find_by(id: @user.id)
  end

  test 'error if user does not exist' do
    get profile_path, as: :json

    assert_response :unauthorized
  end

  test 'error if user cannot be created' do
    post users_path, params: { username: 'fail' }, as: :json

    assert_response :bad_request
    assert_equal "Validation failed: Password can't be blank, Email can't be blank, Email Please provide valid email address",
                 JSON.parse(response.body)['message']
  end

  test 'error if user cannot be deleted' do
    delete users_path

    assert_response :unauthorized
  end

  test 'update active status of user' do
    create_session_for @user

    put users_path, params: { active: false }, as: :json

    assert_response :ok
    assert_not @user.reload[:active]
  end

  test 'update email and username of the user' do
    create_session_for @user
    put users_path, params: { username: 'hola', email: 'hola@test.de' },
                    as: :json

    assert_response :ok
    assert_equal 'hola@test.de', JSON.parse(response.body)['email']
    assert_equal 'hola', JSON.parse(response.body)['username']
  end

  test 'update user fails' do
    create_session_for @user

    put users_path, params: { user: { fail: true } }, as: :json

    assert_response :bad_request
    assert @user.reload[:active]
  end

  test 'fails when no user is logged in' do
    put users_path, params: { active: false }, as: :json

    assert_response :unauthorized
    assert @user.reload[:active]
  end

  test 'update password successfully' do
    create_session_for @user
    
    put users_path, params: { 
      user: { 
        password: 'NewStrongPassword456!', 
        password_confirmation: 'NewStrongPassword456!' 
      } 
    }, as: :json

    assert_response :ok
    
    # Verify user can authenticate with new password
    logout_session
    
    # Try to login with new password
    post '/login', params: { user: { username: @user.username, password: 'NewStrongPassword456!' } }, as: :json
    assert_response :created
  end

  test 'password update fails with mismatched confirmation' do
    create_session_for @user
    
    put users_path, params: { 
      user: { 
        password: 'StrongPassword789!', 
        password_confirmation: 'DifferentPassword123!' 
      } 
    }, as: :json

    assert_response :bad_request
    assert_match /confirmation.*match/i, JSON.parse(response.body)['message']
  end

  test 'update multiple user fields at once' do
    create_session_for @user
    
    put users_path, params: { 
      user: {
        username: 'newusername',
        email: 'newemail@example.com',
        active: false,
        password: 'AnotherStrongPassword123!',
        password_confirmation: 'AnotherStrongPassword123!'
      }
    }, as: :json

    assert_response :ok
    
    response_body = JSON.parse(response.body)
    assert_equal 'newusername', response_body['username']
    assert_equal 'newemail@example.com', response_body['email']
    assert_equal false, response_body['active']
    
    # Verify database changes
    @user.reload
    assert_equal 'newusername', @user.username
    assert_equal 'newemail@example.com', @user.email
    assert_not @user.active
    
    # Verify password was changed
    logout_session
    post '/login', params: { user: { username: 'newusername', password: 'AnotherStrongPassword123!' } }, as: :json
    assert_response :created
  end

  test 'update user with invalid email format' do
    create_session_for @user
    
    put users_path, params: { 
      user: { email: 'invalid-email' } 
    }, as: :json

    assert_response :bad_request
    assert_match /valid email/i, JSON.parse(response.body)['message']
  end

  test 'update user with empty required fields' do
    create_session_for @user
    
    put users_path, params: { 
      user: { 
        username: '', 
        email: '' 
      } 
    }, as: :json

    assert_response :bad_request
    assert_match /can't be blank/i, JSON.parse(response.body)['message']
  end

  test 'password update with empty password clears password change' do
    create_session_for @user
    original_password_digest = @user.password_digest
    
    put users_path, params: { 
      user: { 
        username: 'updated_name',
        password: '',
        password_confirmation: ''
      } 
    }, as: :json

    assert_response :ok
    
    # Password digest should remain unchanged
    @user.reload
    assert_equal original_password_digest, @user.password_digest
    assert_equal 'updated_name', @user.username
  end
end
