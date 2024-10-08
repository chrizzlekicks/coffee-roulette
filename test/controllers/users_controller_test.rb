# frozen_string_literal: true

# # frozen_string_literal: true

require 'test_helper'

class UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(username: 'test', email: 'test@test.de', password: 'randompasswd')
  end

  test 'return all users' do
    create_session_for @user

    get users_path

    assert_response :ok
    assert_equal @user.username, JSON.parse(response.body).first['username']
    assert_equal @user.email, JSON.parse(response.body).first['email']
    assert JSON.parse(response.body).first['active']
  end

  test 'return user by id' do
    create_session_for @user

    get user_path(@user.id)

    assert_response :ok
    assert_equal @user.id, JSON.parse(response.body)['id']
  end

  test 'create new user and return it' do
    assert_emails 1 do
      post users_path, params: { user:{ username: 'test2', email: 'test2@test.de', password: 'salam', password_confirmation: 'salam' }}, as: :json
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
    create_session_for @user
    get user_path(id: 1_234_567_890), as: :json

    assert_response :not_found
    assert_equal "Couldn't find User with 'id'=1234567890", JSON.parse(response.body)['message']
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

  test 'update user fails' do
    create_session_for @user

    put users_path, params: { fail: true }, as: :json

    assert_response :bad_request
    assert @user.reload[:active]
  end

  test 'fails when no user is logged in' do
    put users_path, params: { active: false }, as: :json

    assert_response :unauthorized
    assert @user.reload[:active]
  end
end
