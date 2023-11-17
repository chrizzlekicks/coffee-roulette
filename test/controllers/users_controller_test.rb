require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(:name => 'test', :email => 'test@test.de')
  end

  test 'return all users' do
    get users_path

    assert_response :ok
    assert_equal @user.name, JSON.parse(response.body).first['name']
    assert_equal @user.email, JSON.parse(response.body).first['email']
    assert JSON.parse(response.body).first['active']
  end

  test 'return user by id' do
    get user_path(@user.id)

    assert_response :ok
    assert_equal @user.id, JSON.parse(response.body)['id']
  end

  test 'create new user and return it' do
    post users_path, params: { name: 'test2', email: 'test2@test.de' }, as: :json

    assert_response :created
    assert_equal 'test2@test.de', JSON.parse(response.body)['email']
    assert_equal 'test2', JSON.parse(response.body)['name']
    assert JSON.parse(response.body)['active']
  end

  test 'delete new user' do
    delete user_path(@user.id)

    assert_response :no_content
  end

  test 'error if user does not exist' do
    get user_path(id: 1234567890), as: :json

    assert_response :not_found
    assert_equal "Couldn't find User with 'id'=1234567890", response.body
  end

  test 'error if user cannot be created' do
    post users_path, params: { name: 'fail' }, as: :json

    assert_response :bad_request
    assert_equal "Validation failed: Email can't be blank, Email Please provide valid email address", response.body
  end

  test 'error if user cannot be deleted' do
    delete user_path(id: 1234567890), as: :json

    assert_response :not_found
    assert_equal "Couldn't find User with 'id'=1234567890", response.body
  end
end
