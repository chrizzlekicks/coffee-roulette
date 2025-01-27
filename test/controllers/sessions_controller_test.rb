# frozen_string_literal: true

require 'test_helper'

class SessionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(username: 'test', email: 'test@test.de', password: 'randompasswd')
  end

  test 'does not create a session due to missing user' do
    post login_path, params: { user: { username: 'yolo', password: 'banana' } }

    assert_response :bad_request
    assert_equal 'Username or password seem to be wrong or non existent', JSON.parse(response.body)['message']
  end

  test 'fails due to invalid password' do
    post login_path, params: { user:{ username: @user.username, password: 'randompassword'} }

    assert_response :bad_request
    assert_equal 'Username or password seem to be wrong or non existent', JSON.parse(response.body)['message']
  end

  test 'start a new session and logout afterwards' do
    create_session_for(@user)

    logout_session
  end

  test 'does not log out if no user is signed in' do
    delete logout_path

    assert_response :unauthorized
    assert_equal 'User is not logged in', JSON.parse(response.body)['message']
  end
end
