require "test_helper"

class SessionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(username: 'test', email: 'test@test.de', password: 'randompasswd')
  end

  test "does not create a session due to missing user" do
    post sessions_path, params: { username: "yolo", password: "banana" }

    assert_response :not_found
    assert_equal "User not found", response.body
  end

  test "fails due to invalid password" do
    post sessions_path, params: { username: @user.username, password: 'randompassword'}

    assert_response :bad_request
    assert_equal "Invalid password", response.body
  end

  test "start a new session" do
    post sessions_path, params: { username: @user.username, password: @user.password }, as: :json

    assert_response :created
    assert_equal "Session created", response.body
  end
end
